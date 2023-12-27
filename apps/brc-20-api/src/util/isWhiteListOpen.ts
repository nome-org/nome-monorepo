export async function isWhitelistOpen() {
  return new Date() < new Date("2023-12-27T21:00:00Z")
}
