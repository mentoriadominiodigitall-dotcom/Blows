//#region node_modules/.nitro/vite/services/ssr/assets/errors-nQop9poO.js
var AppError = class extends Error {
	code;
	status;
	constructor(code, message, status = 400) {
		super(message);
		this.name = "AppError";
		this.code = code;
		this.status = status;
	}
};
function publicError(error) {
	if (error instanceof AppError) throw error;
	console.error("[reviva]", error);
	throw new AppError("INTERNAL", "Não foi possível concluir a operação.", 500);
}
//#endregion
export { publicError as n, AppError as t };
