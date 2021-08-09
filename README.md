# Scripted Emitter
A emitter that emits data from a defined script to mock events.

## How to install
`npm install --save @curium.rocks/scripted-emitter`

## Creating a script
```typescript
const fakeEmitter: any = {};

const script: IScript = {
    events: [
        {
            delayToEventMs: 5000,
            dataEvent: {
                timestamp: new Date(),
                data: {
                    dataField1: 'test1'
                },
                emitter: fakeEmitter,
                meta: {}
            }
        },
        {
            delayToEventMs: 15000,
            statusEvent: {
                connected: false,
                bit: false,
                timestamp: new Date()
            },
            dataEvent: {
                timestamp: new Date(),
                data: {
                    dataField2: 'test2'
                },
                emitter: fakeEmitter,
                meta: {}
            }
        },
        {
            delayToEventMs: 5000,
            statusEvent: {
                connected: true,
                bit: false,
                timestamp: new Date()
            }
        }
    ]
}
```

## Example with output
Code

```typescript
import {ScriptedEmitterFactory} from "./scriptedEmitterFactory";

const fakeEmitter: any = {};
const factory = new ScriptedEmitterFactory();
const emitter = await factory.buildEmitter({
    id: 'emitter-id',
    name: 'emitter-name',
    description: 'emitter-description',
    type: ScriptedEmitter.TYPE,
    emitterProperties: {
        script: {
            events: [
                {
                    delayToEventMs: 1000,
                    dataEvent: {
                        timestamp: new Date(),
                        data: {
                            dataField1: 'test1'
                        },
                        emitter: fakeEmitter,
                        meta: {}
                    }
                }
            ]
        }
    }
}) as ScriptedEmitter;

emitter.onData((dataEvt) => {
    console.log(`Data Event: ${JSON.stringify(dataEvt)}`);
});

emitter.start();

setTimeout(() => {
    emitter.dispose();
}, 10000);
```
Output
```
Data Event: {"timestamp":"2021-08-09T01:23:47.387Z","data":{"dataField1":"test1"},"emitter":{},"meta":{}}
Data Event: {"timestamp":"2021-08-09T01:23:47.387Z","data":{"dataField1":"test1"},"emitter":{},"meta":{}}
Data Event: {"timestamp":"2021-08-09T01:23:47.387Z","data":{"dataField1":"test1"},"emitter":{},"meta":{}}
Data Event: {"timestamp":"2021-08-09T01:23:47.387Z","data":{"dataField1":"test1"},"emitter":{},"meta":{}}
Data Event: {"timestamp":"2021-08-09T01:23:47.387Z","data":{"dataField1":"test1"},"emitter":{},"meta":{}}
Data Event: {"timestamp":"2021-08-09T01:23:47.387Z","data":{"dataField1":"test1"},"emitter":{},"meta":{}}
Data Event: {"timestamp":"2021-08-09T01:23:47.387Z","data":{"dataField1":"test1"},"emitter":{},"meta":{}}
Data Event: {"timestamp":"2021-08-09T01:23:47.387Z","data":{"dataField1":"test1"},"emitter":{},"meta":{}}
Data Event: {"timestamp":"2021-08-09T01:23:47.387Z","data":{"dataField1":"test1"},"emitter":{},"meta":{}}
```