// Explicit whitelist: the password hash can never appear in a response.
export const toUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});
