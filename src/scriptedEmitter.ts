import {BaseEmitter, ICommand, IDataEvent, IExecutionResult, LoggerFacade} from '@curium.rocks/data-emitter-base';
import { IDisposable, IStatusEvent } from '@curium.rocks/data-emitter-base/build/src/dataEmitter';

export interface IScriptedEvent {
    delayToEventMs: number;
    dataEvent?: IDataEvent;
    statusEvent?: IStatusEvent;
}

export interface IScript {
    events: Array<IScriptedEvent>;
}

/**
 * 
 */
export class ScriptedEmitter extends BaseEmitter implements IDisposable {
    static readonly TYPE = "SCRIPTED-EMITTER";

    protected script : IScript;
    protected counter : number;
    protected timeoutHandler? : ReturnType<typeof setTimeout>;

    protected lastDataEvent? : IDataEvent;
    protected lastStatusEvent? : IStatusEvent;

    /**
     * 
     * @param {string} id 
     * @param {string} name 
     * @param {string} description 
     * @param {IScript} script
     * @param {LoggerFacade?} loggerFacade 
     */
    constructor(id: string, name: string, description: string, script: IScript, loggerFacade: LoggerFacade|undefined) {
        super(id, name, description, loggerFacade);
        this.script = script;
        this.counter = 0;
    }

    /**
     * 
     */
    protected next(): void {
        const evt = this.script.events[this.counter%this.script.events.length];
        this.timeoutHandler = setTimeout(()=>{
            this.tick(evt);
            this.counter++;
            setImmediate(()=>{
                this.next();
            });
        }, evt.delayToEventMs);
    }

    /**
     * Start executing the script timeline 
     */
    start(): void {
        this.next();
    }

    /**
     * Stop executing the script timeline
     */
    stop(): void {
        if(this.timeoutHandler != null) {
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = undefined;
        }
    }

    /**
     * Execute the event
     * @param {IScriptedEvent} evt
     */
    protected tick(evt:IScriptedEvent): void {
        if(evt.dataEvent) {
            this.notifyDataListeners(evt.dataEvent);
            this.lastDataEvent = evt.dataEvent;
        }
        if(evt.statusEvent) {
            this.notifyStatusListeners(evt.statusEvent);
            this.lastStatusEvent = evt.statusEvent;
        }
    }

    /**
     * 
     * @param {ICommand} command 
     * @return {Promise<IExecutionResult>}
     */
    sendCommand(command: ICommand): Promise<IExecutionResult> {
        const payload = command.payload as Record<string, unknown>;
        if(payload.commandType == null) return Promise.resolve({
            actionId: command.actionId,
            success: false,
            failureReason: 'missing required property commandType'
        });

        if(payload.commandType as string == 'start') {
            this.start();
            return Promise.resolve({
                actionId: command.actionId,
                success: true
            });
        }
        if(payload.commandType as string == 'stop') {
            this.stop();
            return Promise.resolve({
                actionId: command.actionId,
                success: true
            })
        }
        if(payload.commandType as string == 'script') {
            if(payload.script == null) return Promise.resolve({
                actionId: command.actionId,
                success: false,
                failureReason: 'missing required property script'
            });
            const script = payload.script as IScript;
            if(script == null) return Promise.resolve({
                actionId: command.actionId,
                success: false,
                failureReason: 'failed to marshal property script to IScript'
            });

            this.script = script;
            return Promise.resolve({
                actionId: command.actionId,
                success: true
            });
        }
        return Promise.resolve({
            actionId: command.actionId,
            success: false,
            failureReason: 'unknown command'
        })
    }

    /**
     * @return {Promise<IStatusEvent>}
     */
    probeStatus(): Promise<IStatusEvent> {
        if(this.lastStatusEvent) return Promise.resolve(this.lastStatusEvent);
        return Promise.reject(new Error("No status available yet"));
    }

    /**
     * @return {Promise<IDataEvent>}
     */
    probeCurrentData(): Promise<IDataEvent> {
        if(this.lastDataEvent) return Promise.resolve(this.lastDataEvent);
        return Promise.reject(new Error("No data available yet"));
    }

    /**
     * @return {unknown}
     */
    getMetaData(): unknown {
        return {
            script: this.script
        }
    }

    /**
     * 
     * @return {unknown}
     */
    getEmitterProperties(): unknown {
        return {
            script: this.script
        }
    }

    /**
     * @return {string}
     */
    getType(): string {
        return ScriptedEmitter.TYPE;
    }

    /**
     * 
     */
    dispose(): void {
        super.dispose();
        this.stop();
    }

}