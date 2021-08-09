import { describe, it} from 'mocha';
import { expect } from 'chai';
import { IDataEmitter, IEmitterDescription, IFormatSettings, ProviderSingleton } from '@curium.rocks/data-emitter-base';
import { IScript, ScriptedEmitter } from '../src/scriptedEmitter';
import { ScriptedEmitterFactory } from '../src/scriptedEmitterFactory';
import crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fakeEmitter: any = {}

ProviderSingleton.getInstance().registerEmitterFactory(ScriptedEmitter.TYPE, new ScriptedEmitterFactory());
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
const specification : IEmitterDescription = {
    id: 'test-id',
    name: 'test-name',
    description: 'test-description',
    type: ScriptedEmitter.TYPE,
    emitterProperties: {
        script: script
    }
}

/**
 * 
 * @param {IDataEmitter} emitter 
 */
function validateEmitter(emitter: IDataEmitter) : void {
    expect(emitter).to.be.instanceOf(ScriptedEmitter);
    const scriptedEmitter = emitter as ScriptedEmitter;
    expect(scriptedEmitter).to.not.be.null;
    expect(scriptedEmitter.id).to.be.eq(specification.id);
    expect(scriptedEmitter.name).to.be.eq(specification.name);
    expect(scriptedEmitter.description).to.be.eq(specification.description);
    const metaData = scriptedEmitter.getMetaData() as Record<string, unknown>;
    expect(metaData.script).to.be.not.null;
    const newScript = metaData.script as IScript;
    expect(newScript).to.be.eq(script);
}

describe( 'ScriptedEmitterFactory', function() {
    describe( 'buildEmitter()', function() {
        it( 'Should create an emitter to specification', async function() {
            const emitter = await ProviderSingleton.getInstance().buildEmitter(specification);
            validateEmitter(emitter);
        });
    });
    describe( 'recreateEmitter()', function() {
        it( 'Should recreate an emitter to specification from plaintext', async function() {
            const emitter = await ProviderSingleton.getInstance().buildEmitter(specification);
            validateEmitter(emitter);
            const formatSettings : IFormatSettings = {
                encrypted: false,
                type: ScriptedEmitter.TYPE
            }
            const state = await emitter.serializeState(formatSettings);
            const recreatedEmitter = await ProviderSingleton.getInstance().recreateEmitter(state, formatSettings);
            validateEmitter(recreatedEmitter);
        });
        it( 'Should recreate an emitter to specification from aes-256-gcm ciphertext', async function() {
            const emitter = await ProviderSingleton.getInstance().buildEmitter(specification);
            validateEmitter(emitter);
            const formatSettings : IFormatSettings = {
                encrypted: true,
                type: ScriptedEmitter.TYPE,
                algorithm: 'aes-256-gcm',
                key: crypto.randomBytes(32).toString('base64'),
                iv: crypto.randomBytes(64).toString('base64')
            }
            const state = await emitter.serializeState(formatSettings);
            const recreatedEmitter = await ProviderSingleton.getInstance().recreateEmitter(state, formatSettings);
            validateEmitter(recreatedEmitter);
        });
    });
});