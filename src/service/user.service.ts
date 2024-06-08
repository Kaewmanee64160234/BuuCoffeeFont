import type { User } from "@/types/user.type";
import http from "./axios";

function getAllUsers() {
  return http.get("/users");
}
function getUserById(id: number) {
  return http.get(`/users/${id}`);
}
function createUser(user: User) {
  return http.post("/users", user);
}
function updateUser(id: number, user: User) {
  return http.put(`/users/${id}`, user);
}
function deleteUser(id: number) {
  return http.delete(`/users/${id}`);
}

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
