export interface CommentDto {
  id: string;
  userId: string;
  taskId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
}
