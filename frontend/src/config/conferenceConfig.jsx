// Unified legacy lookup maps
export const legacyIdMap = {
  "food-science": "foodscience",
  "nanotechnology": "engineering",
  "chemistry": "engineering"
};

export const getConferenceConfig = (id) => {
  // All configuration and metadata now flows directly from the backend database.
  // There is no static raw data configured on the client side.
  return null;
};
