async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  // Inspect every input field that could reference a file: Read/Grep use
  // file_path/path; Bash/PowerShell use command; mcp executeCode uses code;
  // WebFetch uses url.
  const input = toolArgs.tool_input || {};
  const haystack = [
    input.file_path,
    input.path,
    input.command,
    input.code,
    input.url,
  ]
    .filter(Boolean)
    .join("\n");

  if (/\.env\b/.test(haystack)) {
    console.error("Claude is trying to read the .env file, which is not allowed.");
    process.exit(2);
  }
}

main();
