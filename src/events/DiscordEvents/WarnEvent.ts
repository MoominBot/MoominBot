import BaseEvent from "#base/BaseEvent";
import logger from "#utils/logger";

export default class extends BaseEvent {
    constructor() {
        super("warn");
    }

    public override execute(warning: string) {
        logger.warn(warning);
    }
}
