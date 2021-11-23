import BaseEvent from "../../base/BaseEvent.js";
import logger from "../../logger.js";

export default class extends BaseEvent {
    constructor() {
        super("warn");
    }

    public override execute(warning: string) {
        logger.warn(warning);
    }
}
