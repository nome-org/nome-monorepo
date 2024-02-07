export function reverseEndianHex(hexString: string): string {
  // Check that the length of the string is even (to ensure each byte has two characters)
  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hexadecimal string")
  }

  let result = ""

  // Reverse the order of bytes in pairs
  for (let i = hexString.length - 2; i >= 0; i -= 2) {
    result += hexString[i]! + hexString[i + 1]
  }

  return result
}
