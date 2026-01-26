# Tutorial 4: filesystem basics (`std::fs`)

This tutorial demonstrates a very common “systems script” pattern:

1. create a directory
2. write a file
3. read it back
4. clean up

Reference: `std::fs` (sidebar → standard library).

## Program: write and read back a small file

Create `fs_roundtrip.slk`:

```silk
import std::fs;
import std::io::println;

fn main () -> int {
  // 493 == 0o755 on POSIX.
  if std::fs::mkdir_all("tmp", 493) != None {
    println("mkdir failed");
    return 1;
  }

  let path: string = "tmp/tutorial_fs_roundtrip.txt";
  std::fs::unlink(path); // ignore errors; we just want the file gone

  // 420 == 0o644 on POSIX.
  match (std::fs::write_file_string(path, "hello\\n", 420)) {
    Ok(_) => {},
    Err(_) => {
      println("write failed");
      std::fs::unlink(path);
      return 2;
    },
  }

  match (std::fs::read_file_string(path)) {
    Ok(s) => {
      println("read: {s}", s.as_string());
      std::fs::unlink(path);
      return 0;
    },
    Err(_) => {
      println("read failed");
      std::fs::unlink(path);
      return 3;
    },
  }
}
```

Build and run:

```bash
silk check fs_roundtrip.slk
silk build fs_roundtrip.slk -o build/fs_roundtrip
./build/fs_roundtrip
```

## What to take away

- `std::fs` uses explicit return shapes (`Result(...)` or optional errors) so failure handling stays visible.
- Whole-file helpers (`read_file_string`, `write_file_string`) are the easiest way to get real work done early.
- For deeper control (streaming I/O, seeking, file handles), `std::fs::File` exposes a lower-level handle API.

## Next

- Tutorial 5: [Concurrency basics](?p=usage/tutorials/05-concurrency)

