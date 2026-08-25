# GPU launch blocks

Silk provides a checked host-side form for launching one GPU kernel without
importing a launch function or repeating the kernel name as a string:

```silk
gpu (grid=8, workspace=8) {
  fill(output.address, 42);
}
```

The existing statement form discards the result. The same form may be used in
value position to inspect both runtime phases:

```silk
import { DispatchResult } from "std/gpu";

let dispatch: DispatchResult = gpu (grid=8, workspace=8) {
  fill(output.address, 42);
};
if dispatch.launch_failed() {
  return 2;
}
if dispatch.synchronize_failed() {
  return 3;
}
```

`gpu` is a reserved keyword. A launch block is valid in ordinary host
functions, `async fn`, `task fn`, and combined async/task host functions. It is
not valid inside `attr(device=gpu)` code. The block contains exactly one direct
call to a launchable GPU function in the executable's root package.

## Syntax

The header contains exactly two named options:

- `grid=<expression>` is the total one-dimensional work-item count.
- `workspace=<expression>` is the one-dimensional work-group size.

Both options are required exactly once and may appear in either order. Their
expressions must have type `u64`. The body must contain exactly one direct,
unqualified function call followed by `;`. Field calls, qualified calls,
function values, generic call arguments, declarations, control flow, and
multiple calls are rejected in this initial form. A statement-position launch
needs no semicolon after `}`. Normal expression-containing syntax supplies its
own delimiter, such as the `;` that ends a `let` initializer.

Runtime geometry must be nonzero and exactly divisible, the workgroup must not
exceed 1024 work items, the total grid must not exceed `4294967295` work items,
and `grid / workspace` must not exceed `2147483647` provider blocks. Invalid
geometry returns a nonzero launch status and is still followed by the checked
form's one synchronization attempt.

The called declaration must satisfy the launchable-entry contract from
`gpu-execution.md`: it is a normal, non-generic root-package
`attr(device=gpu)` function returning `void`, with at most 32 immutable `u64`
parameters and no defaults, varargs, or typed errors. The compiler resolves the
name and checks the call arguments against that declaration at compile time. A
same-package import alias is permitted; the compiler records the declaration's
lexical name in the runtime launch rather than treating the alias as a kernel
symbol. An ordinary host function, a dependency-package GPU function, or a
device-only helper with a non-launchable signature cannot be used as the
target.

## Desugaring and execution

For a valid target, the form

```silk
gpu (grid=grid_size, workspace=group_size) {
  classify(input.address, output.address, threshold);
}
```

has the execution behavior of:

```silk
launch_and_synchronize(
  "classify",
  grid_size,
  group_size,
  input.address,
  output.address,
  threshold
);
```

The compiler supplies a hidden binding to the shipped
`std::gpu::launch_and_synchronize` implementation, so the source file need not
import that function. The binding uses a compiler-only name outside the Silk
identifier grammar, so an application declaration cannot collide with it. The
standard library remains the replaceable runtime implementation behind the
form; `--nostd` rejects a launch block because no implementation is available.

`launch_and_synchronize` calls `launch` and then calls `synchronize` exactly
once, including when launch reports a nonzero status. It returns a
`std::gpu::DispatchResult` with independent `launch_status` and
`synchronize_status` fields. Status `0` means success for that phase. The
`is_ok()`, `launch_failed()`, and `synchronize_failed()` methods provide the
corresponding queries without hiding either raw status.

Statement position discards this result for source compatibility. Value
position retains it as an ordinary value, so it may be bound, returned, placed
in an aggregate, passed to a host function, or queried directly wherever its
type is accepted. The result belongs to that dispatch; no process-global last
status is involved, so task workers cannot read one another's result.

A statement-level `attr(...)` prefix applies to the launch block as one source
statement. The compiler preserves that metadata on the generated combined
operation, so synchronization cannot escape metadata attached to its launch.

Inside an `async fn` or `task fn`, this completion boundary is an ordinary
blocking host runtime call. It does not suspend the coroutine, yield a task, or
free the current executor thread while the GPU runs. Use the manual APIs when a
program needs overlap between dispatches, immediate diagnostic text between
phases, or a different scheduling strategy. The shipped process-global runtime
serializes its public operations so task-worker threads cannot race runtime
state. Separate tasks may still interleave between the combined operation's
launch and synchronize calls; the device-wide synchronize operation completes
all work submitted before it.

The checked form is the preferred status-aware path when automatic completion
is wanted. The separate public manual APIs remain available for explicit
overlap:

```silk
import { launch } from "std/gpu";

if launch("classify", grid_size, group_size, input, output, threshold) != 0 {
  return 2;
}
```

Code that intentionally uses the string-name convention but still wants one
completed-dispatch result may call the same public facade directly:

```silk
import { DispatchResult, launch_and_synchronize } from "std/gpu";

let dispatch: DispatchResult = launch_and_synchronize(
  "classify",
  grid_size,
  group_size,
  input,
  output,
  threshold
);
```

The manual string-name convention remains supported. It is also the current
escape hatch for reading `last_error()` immediately after launch, overlapping
host work, and choosing when to synchronize. The compiler cannot prove that a
runtime device, runtime library, or embedded artifact is available merely from
a valid launch block.

## Portability

The syntax is target-neutral. It names execution geometry and a Silk GPU
function, not HIP, CUDA, AMD, or NVIDIA ABI details. The selected GPU backend
owns artifact generation and runtime adaptation. GPU v1 targets AMDHSA through
HIP and NVIDIA PTX through the CUDA Driver API with the same source form and
checker rules.

See `gpu-execution.md` for placement and device-call rules,
[gpu](?p=std/gpu) for buffers and synchronization, and
[backend gpu](?p=compiler/backend-gpu) for the shared backend boundary.
