import { BaseEmitterFactory, IDataEmitter, IEmitterDescription } from "@curium.rocks/data-emitter-base";
import { IScript, ScriptedEmitter } from "./scriptedEmitter";

/**
 * 
 */
export class ScriptedEmitterFactory extends BaseEmitterFactory {
    
    /**
     * 
     * @param {IEmitterDescription} description 
     * @return {Promise<IDataEmitter>}
     */
    buildEmitter(description: IEmitterDescription): Promise<IDataEmitter> {
        if(description.emitterProperties == null) return Promise.reject(new Error("missing required emitterProperties"));
        const props = description.emitterProperties as Record<string, unknown>;
        if(props.script == null) return Promise.reject(new Error("missing required property script"));
        const script = props.script as IScript;
        if(script == null) return Promise.reject(new Error("invalid script format"));
        return Promise.resolve(new ScriptedEmitter(description.id, description.name, description.description, script, this.loggerFacade))
    }
}