export const encode = (value: String) => {
  return Buffer.from(value).toString("base64");
};

export const decode = (value: String) => {
  return Buffer.from(value, "base64").toString("ascii");
};
