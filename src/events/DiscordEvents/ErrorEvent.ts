import BaseEvent from "../../base/BaseEvent.js";
import logger from "../../logger.js";

export default class extends BaseEvent {
    constructor() {
        super("error");
    }

    public override execute(errorMessage: Error) {
        logger.error(errorMessage.stack ?? errorMessage);
    }
}
