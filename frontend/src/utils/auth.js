// Helper function to extract token and format the Authorization header explicitly
export const getAuthHeader = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  
  if (userInfo && userInfo.token) {
    console.log("Helper Token Retrieved:", userInfo.token.substring(0, 15) + "...");
    return { Authorization: `Bearer ${userInfo.token}` };
  }
  
  return {};
};
