const { CommentRepository } = require("../../DAL/Repositories/CommentRepository");

class CommentService {
  private commentRepository: any;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  async getComments(expenseId: string) {
    if (!expenseId) {
      throw new Error("ID troška je obavezan.");
    }

    return this.commentRepository.getByExpenseId(expenseId);
  }

  async addComment(expenseId: string, tekst: string, authUser: any) {
    if (!expenseId) {
      throw new Error("ID troška je obavezan.");
    }

    if (!tekst || !tekst.trim()) {
      throw new Error("Tekst komentara je obavezan.");
    }

    const autorId = await this.commentRepository.findOrCreateUserFromAuth(authUser);
    if (!autorId) {
      throw new Error("Nije moguće identificirati autora komentara.");
    }

    return this.commentRepository.create(expenseId, tekst.trim(), autorId);
  }
}

module.exports = { CommentService };
