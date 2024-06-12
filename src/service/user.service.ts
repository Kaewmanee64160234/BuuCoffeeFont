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
  return http.patch (`/users/${id}`, user);
}
function deleteUser(id: number) {
  return http.delete(`/users/${id}`);
}
function searchUsers(query: string) {
  return http.get(`/users/search`, {
    params: {
      query,
    },
  });
}

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers
};
