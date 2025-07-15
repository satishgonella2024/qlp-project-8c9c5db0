let users: { [key: string]: { id: string; name: string; email: string; password: string } } = {};
let userId = 1;

export function addUser(user: { name: string; email: string; password: string }) {
  const newUser = { id: userId.toString(), name, email, password: user.password };
  users[userId.toString()] = newUser;
  userId++;
  return newUser;
}

export function findUserById(id: string) {
  return users[id];
}

export function updateUser(id: string, user: { name: string; email: string; password: string }) {
  const updatedUser = { ...users[id], ...user };
  users[id] = updatedUser;
  return updatedUser;
}

export function deleteUser(id: string) {
  delete users[id];
}