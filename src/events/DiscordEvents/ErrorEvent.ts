import BaseEvent from "#base/BaseEvent";
import logger from "#utils/logger";

export default class extends BaseEvent {
    constructor() {
        super("error");
    }

    public override execute(errorMessage: Error) {
        logger.error(errorMessage.stack ?? errorMessage);
    }
}
