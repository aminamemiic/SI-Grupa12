import type { IAuthService } from "../../BLL/Interfaces/IAuthService";
const { CommentService } = require("../../BLL/Services/CommentService");

function registerCommentEndpoints(app: any, authService: IAuthService, _logger?: any) {
  const commentService = new CommentService();

  app.get(
    "/api/troskovi/:id/komentari",
    authService.requireAuthentication,
    authService.requireRole("admin", "administrativni_radnik", "administrativni_zaposlenik", "glavni_racunovodja", "finansijski_direktor"),
    async (req: any, res: any) => {
      try {
        const comments = await commentService.getComments(req.params.id);
        return res.status(200).json(comments);
      } catch (error: any) {
        console.error("Greška pri dohvatu komentara:", error);
        return res.status(400).json({
          message: error.message || "Greška pri dohvatu komentara.",
        });
      }
    }
  );

  app.post(
    "/api/troskovi/:id/komentari",
    authService.requireAuthentication,
    authService.requireRole("admin", "administrativni_radnik", "administrativni_zaposlenik", "glavni_racunovodja", "finansijski_direktor"),
    async (req: any, res: any) => {
      try {
        const comment = await commentService.addComment(
          req.params.id,
          req.body.tekst,
          req.user
        );
        return res.status(201).json(comment);
      } catch (error: any) {
        console.error("Greška pri dodavanju komentara:", error);
        return res.status(400).json({
          message: error.message || "Greška pri dodavanju komentara.",
        });
      }
    }
  );
}

module.exports = { registerCommentEndpoints };
