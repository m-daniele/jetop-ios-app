export async function generateNicknames(prompt: string): Promise<string[]> {
  try {
    // Replace with your actual IP address
    const res = await fetch("http://192.168.1.56:3001/nickname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    // console.log("Response data:", data); // Debug log
    
    return data.response.split("\n").filter((line: string) => line.trim() !== "");
  } catch (error) {
    console.error("Error generating nicknames:", error);
    throw error;
  }
}