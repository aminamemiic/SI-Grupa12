export {};

const mockCommentRepository = {
  getByExpenseId: jest.fn(),
  create: jest.fn(),
  findOrCreateUserFromAuth: jest.fn(),
};

jest.mock("../DAL/Repositories/CommentRepository", () => ({
  CommentRepository: jest.fn().mockImplementation(() => mockCommentRepository),
}));

const { CommentService } = require("../BLL/Services/CommentService");

describe("CommentService - Komentari na troškove (US-44, US-45)", () => {
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommentService();
  });

  describe("getComments", () => {
    test("treba vratiti komentare za dati trošak hronološki", async () => {
      const comments = [
        {
          id: "1",
          tekst: "Prvi komentar",
          vrijemeUnosa: "2026-06-01T10:00:00Z",
          autorId: "user-1",
          autorIme: "Admin",
          autorPrezime: "Admin",
        },
        {
          id: "2",
          tekst: "Drugi komentar",
          vrijemeUnosa: "2026-06-01T11:00:00Z",
          autorId: "user-2",
          autorIme: "Glavni",
          autorPrezime: "Racunovodja",
        },
      ];
      mockCommentRepository.getByExpenseId.mockResolvedValue(comments);

      const result = await service.getComments("expense-1");

      expect(result).toEqual(comments);
      expect(mockCommentRepository.getByExpenseId).toHaveBeenCalledWith("expense-1");
    });

    test("treba baciti grešku ako ID troška nije poslan", async () => {
      await expect(service.getComments("")).rejects.toThrow("ID troška je obavezan");
    });

    test("treba vratiti prazan niz kad nema komentara", async () => {
      mockCommentRepository.getByExpenseId.mockResolvedValue([]);

      const result = await service.getComments("expense-1");

      expect(result).toEqual([]);
    });
  });

  describe("addComment", () => {
    test("treba dodati komentar i vratiti ga sa podacima autora", async () => {
      mockCommentRepository.findOrCreateUserFromAuth.mockResolvedValue("user-1");
      mockCommentRepository.create.mockResolvedValue({
        id: "1",
        tekst: "Test komentar",
        vrijemeUnosa: "2026-06-01T12:00:00Z",
        autorId: "user-1",
        autorIme: "Admin",
        autorPrezime: "Admin",
      });

      const result = await service.addComment("expense-1", "Test komentar", { sub: "auth0|user" });

      expect(result).toBeDefined();
      expect(result.tekst).toBe("Test komentar");
      expect(result.autorIme).toBe("Admin");
      expect(mockCommentRepository.create).toHaveBeenCalledWith("expense-1", "Test komentar", "user-1");
    });

    test("treba baciti grešku ako je tekst prazan", async () => {
      await expect(
        service.addComment("expense-1", "", { sub: "user" })
      ).rejects.toThrow("Tekst komentara je obavezan");
    });

    test("treba baciti grešku ako korisnik ne može biti identifikovan", async () => {
      mockCommentRepository.findOrCreateUserFromAuth.mockResolvedValue(null);

      await expect(
        service.addComment("expense-1", "Test", {})
      ).rejects.toThrow("Nije moguće identificirati autora");
    });

    test("treba trimati tekst komentara", async () => {
      mockCommentRepository.findOrCreateUserFromAuth.mockResolvedValue("user-1");
      mockCommentRepository.create.mockResolvedValue({
        id: "1",
        tekst: "Test",
        autorIme: "A",
        autorPrezime: "B",
      });

      await service.addComment("expense-1", "  Test  ", { sub: "user" });

      expect(mockCommentRepository.create).toHaveBeenCalledWith("expense-1", "Test", "user-1");
    });
  });
});
