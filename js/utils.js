export const API_URL =  "https://12564f94-3afc-4e97-8d80-a8411afeb3fd.mock.pstmn.io/api/"; //prettier-ignore

export const apiFetch = async (endpoint) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { error: error.message };
  }
};
