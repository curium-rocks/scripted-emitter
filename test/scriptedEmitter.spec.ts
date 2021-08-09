import { describe, it} from 'mocha';
import { expect } from 'chai';
import { IDataEvent, IEmitterDescription } from '@curium.rocks/data-emitter-base';
import { ScriptedEmitter, IScript } from '../src/scriptedEmitter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fakeEmitter: any = {}
const simpleScript: IScript = {
    events: [
        {
            delayToEventMs: 100,
            dataEvent: {
                timestamp: new Date(),
                data: {
                    test45: 'test45'
                },
                emitter: fakeEmitter,
                meta: {}
            }
        }
    ]
}
const script : IScript = {
    events: [
        {
            delayToEventMs: 100,
            dataEvent: {
                timestamp: new Date(),
                data: {
                    test1: 'test1'
                },
                emitter: fakeEmitter,
                meta: {}
            }
        },
        {
            delayToEventMs: 100,
            statusEvent: {
                connected: true,
                bit: false,
                timestamp: new Date()
            }
        },
        {
            delayToEventMs: 100,
            dataEvent: {
                timestamp: new Date(),
                data: {
                    test2: 'test2'
                },
                emitter: fakeEmitter,
                meta: {}
            }
        },
        {
            delayToEventMs: 100,
            dataEvent: {
                timestamp: new Date(),
                data: {
                    test3: 'test3'
                },
                emitter: fakeEmitter,
                meta: {}
            }
        }
    ]
}
const sleep = (ms: number) : Promise<void> => {
    return new Promise((resolve)=>{
        setTimeout(resolve, ms);
    })
}
describe( 'ScriptedEmitter', function() {
    describe( 'start()', function() {
        it( 'Should execute the script', async function() {
            const emitter = new ScriptedEmitter('test', 'test', 'test', script, undefined);
            try {
                let dataEvt: IDataEvent | null= null;
                emitter.onData((evt) => {
                    dataEvt = evt;
                });
                emitter.start();
                await sleep(150);
                expect(dataEvt).to.not.be.null;
                expect(dataEvt).to.be.eq(script.events[0].dataEvent);
            } finally {
                emitter.dispose();
            }
        });
    });
    describe( 'stop()', function() {
        it( 'Should stop executing the script', async function() {
            const emitter = new ScriptedEmitter('test', 'test', 'test', script, undefined);
            try {
                let dataEvt: IDataEvent | null= null;
                emitter.onData((evt) => {
                    dataEvt = evt;
                });
                emitter.start();
                await sleep(25);
                emitter.stop();
                await sleep(150);
                expect(dataEvt).to.be.null;
            } finally {
                emitter.dispose();
            }        
        });
    });
    describe( 'dispose()', function() {
        it( 'Should stop the script', async function() {
            const emitter = new ScriptedEmitter('test', 'test', 'test', script, undefined);
            try {
                let dataEvt: IDataEvent | null= null;
                emitter.onData((evt) => {
                    dataEvt = evt;
                });
                emitter.start();
                await sleep(25);
                emitter.dispose();
                await sleep(150);
                expect(dataEvt).to.be.null;
            } finally {
                emitter.dispose();
            }          
        })
    });
    describe('probeStatus()', function() {
        it( 'Should provide the latest event', async function() {
            const emitter = new ScriptedEmitter('test', 'test', 'test', script, undefined);
            try {
                emitter.start();
                await sleep(650);
                const status = await emitter.probeStatus();
                expect(status).to.be.eq(script.events[1].statusEvent);
            } finally {
                emitter.dispose();
            }
        })
    });
    describe('probeCurrentData()', function() {
        it( 'Should provide the latest event', async function() {
            const emitter = new ScriptedEmitter('test', 'test', 'test', script, undefined);
            try {
                emitter.start();
                await sleep(450);
                const data = await emitter.probeCurrentData();
                expect(data).to.be.eq(script.events[3].dataEvent);
            } finally {
                emitter.dispose();
            }        
        })
    });
    describe('sendCommand()', function() {
        it( 'Should allow starting the script', async function() {
            const emitter = new ScriptedEmitter('test', 'test', 'test', script, undefined);
            try {
                let dataEvt: IDataEvent | null= null;
                emitter.onData((evt) => {
                    dataEvt = evt;
                });
                const result = await emitter.sendCommand({
                    actionId: 'test',
                    payload: {
                        commandType: 'start'
                    }
                })
                expect(result.success).to.be.true;
                await sleep(150);
                expect(dataEvt).to.not.be.null;
                expect(dataEvt).to.be.eq(script.events[0].dataEvent);
            } finally {
                emitter.dispose();
            }        
        });
        it( 'Should allow stopping the script', async function() {
            const emitter = new ScriptedEmitter('test', 'test', 'test', script, undefined);
            try {
                let dataEvt: IDataEvent | null= null;
                emitter.onData((evt) => {
                    dataEvt = evt;
                });
                const result = await emitter.sendCommand({
                    actionId: 'test',
                    payload: {
                        commandType: 'start'
                    }
                })
                expect(result.success).to.be.true;
                await sleep(50);
                const stopResult = await emitter.sendCommand({
                    actionId: 'test2',
                    payload: {
                        commandType: 'stop'
                    }
                })
                expect(stopResult.success).to.be.true;
                await sleep(150);
                expect(dataEvt).to.be.null;
            } finally {
                emitter.dispose();
            }         
        });
        it( 'Should allow setting the script', async function() {
            const emitter = new ScriptedEmitter('test', 'test', 'test', script, undefined);
            try {
                let dataEvt: IDataEvent | null= null;
                emitter.onData((evt) => {
                    dataEvt = evt;
                });
                const scriptResult = await emitter.sendCommand({
                    actionId: 'test4',
                    payload: {
                        commandType: 'script',
                        script: simpleScript
                    }
                });
                expect(scriptResult.success).to.be.true;
                const result = await emitter.sendCommand({
                    actionId: 'test',
                    payload: {
                        commandType: 'start'
                    }
                })
                expect(result.success).to.be.true;
                await sleep(150);
                expect(dataEvt).to.not.be.null;
                expect(dataEvt).to.be.eq(simpleScript.events[0].dataEvent);
            } finally {
                emitter.dispose();
            }         
        });
    })
});