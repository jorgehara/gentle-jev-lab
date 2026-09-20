export function authenticate(request, users) {
  const token = request.headers.authorization?.replace("Bearer ", "");
  return users.find((user) => user.token === token) ?? null;
}
