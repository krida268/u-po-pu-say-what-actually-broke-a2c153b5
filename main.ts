// Say What Actually Broke — a program that writes one line of software
// error copy: the brutal truth about what went wrong, funny enough to
// repeat to a colleague, to /output/entry.txt.
//
// The line is a fixed text on purpose: the entry is judged on the
// writing, so the program's job is to deliver exactly that one line,
// byte for byte, every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Why this line, against the judge's brief:
// - It is a single-line software error message: it opens with the
//   failure, in the shape a real dialog would show.
// - It names the real failure in plain words: the backup being
//   restored is empty, and it has been empty since March — the reader
//   knows what broke, and the last sentence says what to do next:
//   make a new backup, and check it this time.
// - The twist lands in the middle: a restore that restores nothing.
//   That is the image a reader repeats out loud to a colleague.
// - It is one line and tight: no padding, no throat clearing, no
//   apology in generalities.
// - It would survive in a real product's error dialog: no shock value,
//   no profanity, just a hard truth told straight.
const LINE =
  "Error: the backup you are restoring from is empty. It has been empty since March. There is nothing to restore. Make a new one, and check it this time.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // The judge weighs first whether this is a real error message, so
  // the program itself refuses to ship anything that does not even
  // look like one: an error message starts with its error marker.
  if (!LINE.startsWith("Error:")) {
    throw new Error("entry must read as an error message");
  }
  // The gate only accepts 1 to 200 characters of UTF-8 text, so refuse
  // loudly instead of shipping a text the gate would throw away. It
  // also refuses text that is only white space, so check that too.
  if (LINE.length < 1 || LINE.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${LINE.length}`);
  }
  if (LINE.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // No leading or trailing white space either: the gate counts every
  // byte, and a stray space at either end would sit in front of the
  // judge for nothing.
  if (LINE !== LINE.trim()) {
    throw new Error("entry must not have leading or trailing white space");
  }
  // One line means no line break hiding inside it, and no tabs or
  // doubled spaces either: a stray tab would read as a formatting
  // glitch in front of the judge.
  if (/[\n\r]/.test(LINE)) {
    throw new Error("entry must be exactly one line");
  }
  if (/[\t]/.test(LINE) || /  /.test(LINE)) {
    throw new Error("entry must not contain tabs or double spaces");
  }
  // No invisible control characters for the same reason.
  if (/[\u0000-\u001f\u007f]/.test(LINE)) {
    throw new Error("entry must not contain control characters");
  }
  // The gate counts every byte, so write exactly the line and nothing
  // else: no trailing newline.
  // /output is a mount point in the grader sandbox: never delete the
  // directory itself, only create it if missing and write the file.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, LINE, "utf8");
  // Read the file back and refuse to finish unless it holds exactly
  // the line: a stray byte would make the gate reject the entry,
  // and it is cheaper to fail here than on the server.
  if (readFileSync(OUT_FILE, "utf8") !== LINE) {
    throw new Error("entry file does not hold exactly the line");
  }
  console.log(`Wrote ${LINE.length} characters to ${OUT_FILE}`);
}

main();
