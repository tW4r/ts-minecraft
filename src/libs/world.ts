import fileType = require("file-type");
import * as fs from "fs";
import * as path from "path";
import { bufferEntry, open, walkEntries } from "yauzlw";
import { inflateSync } from "zlib";
import { GameType } from "./game";
import { NBT } from "./nbt";
export interface PlayerDataFrame {
    UUIDLeast: Long;
    UUIDMost: Long;
    DataVersion: number;

    Pos: [
        number, number, number
    ];
    Rotation: [
        number, number, number
    ];
    Motion: [
        number, number, number
    ];
    Dimension: number;

    SpawnX: number;
    SpawnY: number;
    SpawnZ: number;

    playerGameType: number;

    Attributes: Array<{
        Base: number,
        Name: string,
    }>;

    HurtTime: number;
    DeathTime: number;
    HurtByTimestamp: number;
    SleepTimer: number;
    SpawnForced: number;
    FallDistance: number;
    SelectedItemSlot: number;
    seenCredits: number;

    Air: number;
    AbsorptionAmount: number;
    Invulnerable: number;
    FallFlying: number;
    PortalCooldown: number;
    Health: number;
    OnGround: number;
    XpLevel: number;
    Score: number;
    Sleeping: number;
    Fire: number;
    XpP: number;
    XpSeed: number;
    XpTotal: number;

    foodLevel: number;
    foodExhaustionLevel: number;
    foodTickTimer: number;
    foodSaturationLevel: number;

    recipeBook: {
        isFilteringCraftable: number,
        isGuiOpen: number,
    };
    abilities: {
        invulnerable: number,
        mayfly: number,
        instabuild: number,
        walkSpeed: number,
        mayBuild: number,
        flying: number,
        flySpeed: number,
    };
}

type StringBoolean = "true" | "false";
export interface LevelDataFrame {
    BorderCenterX: number;
    BorderCenterZ: number;
    BorderDamagePerBlock: number;
    BorderSafeZone: number;
    BorderSize: number;
    BorderSizeLerpTarget: number;
    BorderSizeLerpTime: Long;
    BorderWarningBlocks: number;
    BorderWarningTime: number;
    DataVersion: number;
    DayTime: Long;
    Difficulty: number;
    DifficultyLocked: number;
    DimensionData: {
        [dimension: number]: {
            DragonFight: {
                Gateways: number[],
                DragonKilled: number,
                PreviouslyKilled: number,
                ExitPortalLocation?: [number, number, number],
            },
        },
    };
    GameRules: {
        doTileDrops: StringBoolean,
        doFireTick: StringBoolean,
        gameLoopFunction: string,
        maxCommandChainLength: string,
        reducedDebugInfo: string,
        naturalRegeneration: string,
        disableElytraMovementCheck: string,
        doMobLoot: StringBoolean,
        announceAdvancements: string,
        keepInventory: StringBoolean,
        doEntityDrops: StringBoolean,
        doLimitedCrafting: StringBoolean,
        mobGriefing: StringBoolean,
        randomTickSpeed: string,
        commandBlockOutput: string,
        spawnRadius: string,
        doMobSpawning: StringBoolean,
        maxEntityCramming: string,
        logAdminCommands: string,
        spectatorsGenerateChunks: string,
        doWeatherCycle: StringBoolean,
        sendCommandFeedback: string,
        doDaylightCycle: StringBoolean,
        showDeathMessages: StringBoolean,
    };
    GameType: GameType;
    LastPlayed: Long;
    LevelName: string;
    MapFeatures: number;
    Player: PlayerDataFrame;
    RandomSeed: Long;
    readonly SizeOnDisk: Long;
    SpawnX: number;
    SpawnY: number;
    SpawnZ: number;
    Time: Long;
    Version: {
        Snapshot: number,
        Id: number,
        Name: string,
    };
    allowCommands: number;
    clearWeatherTime: number;
    generatorName: "default" | "flat" | "largeBiomes" | "amplified" | "buffet" | "debug_all_block_states" | string;
    generatorOptions: string;
    generatorVersion: number;
    hardcore: number;
    initialized: number;
    rainTime: number;
    raining: number;
    thunderTime: number;
    thundering: number;
    version: number;
}
export interface World {
    path: string;
    level: LevelDataFrame;
    players: PlayerDataFrame[];
    advancements: AdvancementDataFrame[];
}

export interface AdvancementDataFrame {
    display?: {
        background?: string,
        description: object | string,
        show_toast: boolean,
        announce_to_chat: boolean,
        hidden: boolean,
    };
    parent?: string;
    criteria: { [name: string]: { trigger: string, conditions: {} } };
    requirements: string[];
    rewards: { recipes: string[], loot: string[], experience: number, function: string };
}

export interface ItemStackDataFrame {
    Slot: number;
    id: string;
    Count: number;
    Damage: number;
    tag?: {
        // general tags
        Unbreakable: number,
        CanDestroy: string[],

        // block tags
        CanPlaceOn: string[],
        BlockEntityTag: {
            // entity format
        },

        // enchantments
        ench: Array<{ id: number, lvl: number }>,
        StoredEnchantments: Array<{ id: number, lvl: number }>,
        RepairCost: number,

        // attribute modifiers
        AttributeModifiers: Array<{ AttributeName: string, Name: string, Slot: string, Operation: number, Amount: number, UUIDMost: Long, UUIDLeast: Long }>,

        // potion effects
        CustomPotionEffects: Array<{ Id: number, Amplifier: number, Duration: number, Ambient: number, ShowParticles: number }>,
        Potion: string,
        CustomPotionColor: number,

        // display properties
        display: Array<{ color: number, Name: string, LocName: string, Lore: string[] }>,
        HideFlags: number,

        // written books
        resolved: number,
        /**
         * The copy tier of the book. 0 = original, number = copy of original, number = copy of copy, number = tattered.
         * If the value is greater than number, the book cannot be copied. Does not exist for original books.
         * If this tag is missing, it is assumed the book is an original. 'Tattered' is unused in normal gameplay, and functions identically to the 'copy of copy' tier.
         */
        generation: number,
        author: string,
        title: string,
        /**
         * A single page in the book. If generated by writing in a book and quill in-game, each page is a string in double quotes and uses the escape sequences \" for a double quote,
         * for a line break and \\ for a backslash. If created by commands or external tools, a page can be a serialized JSON object or an array of strings and/or objects (see Commands#Raw JSON text) or an unescaped string.
         */
        pages: string[],

        // player heads
    };
}
export interface TileEntityDataFrame {
    x: number;
    y: number;
    z: number;
    Items: ItemStackDataFrame[];
    id: string;
    [key: string]: any;
}

export interface RegionDataFrame {
    Level: {
        xPos: number;
        zPos: number;

        LightPopulated: number;
        LastUpdate: Long;
        InhabitedTime: Long;

        HeightMap: number[];
        Biomes: number[];
        Entities: object[];
        TileEntities: TileEntityDataFrame[];
        Sections: Array<{
            Blocks: number[],
            Data: number[],
            BlockLight: number[],
            SkyLight: number[],
            Y: number,
        }>;
    };
    DataVersion: number;
}

export namespace World {
    function getChunkOffset(buffer: Buffer, x: number, z: number) {
        x = Math.abs(((x % 32) + 32) % 32);
        z = Math.abs(((z % 32) + 32) % 32);
        const locationOffset = 4 * (x + z * 32);
        const bytes = buffer.slice(locationOffset, locationOffset + 4);
        const sectors = bytes[3];
        const offset = bytes[0] << 16 | bytes[1] << 8 | bytes[2];
        if (offset === 0) {
            return 0;
        } else {
            return offset * 4096;
        }
    }

    export function loadRegionFromBuffer(buffer: Buffer, x: number, z: number): RegionDataFrame {
        const off = getChunkOffset(buffer, x, z);
        const length = buffer.readInt32BE(off);
        const format = buffer.readUInt8(off + 4);
        if (format !== 2) {
            throw new Error(`Cannot resolve chunk with format ${format}.`);
        }
        const chunkData = buffer.slice(off + 5, off + 5 + length);
        return NBT.Serializer.deserialize(inflateSync(chunkData), false) as any as RegionDataFrame;
    }

    export function getRegionFile(location: string, x: number, z: number) {
        return path.join(location, "region", `r.${x}.${z}.mca`);
    }

    export async function load<K extends string & keyof World & ("players" | "advancements" | "level")>(location: string, entries: K[]): Promise<Pick<World, K | "path">> {
        const isDir = await fs.promises.stat(location).then((s) => s.isDirectory());
        const enabledFunction = entries.reduce((o, v) => { o[v] = true; return o; }, {} as { [k: string]: boolean });
        const result: Partial<World> & Pick<World, "players" | "advancements"> = {
            path: path.resolve(location),
            players: [],
            advancements: [],
        };
        if (!isDir) {
            const buffer = await fs.promises.readFile(location);
            const ft = fileType(buffer);
            if (!ft || ft.ext !== "zip") { throw new Error("IllgalMapFormat"); }

            const zip = await open(buffer, { lazyEntries: true });
            await walkEntries(zip, (e) => {
                if (enabledFunction.level && e.fileName.endsWith("/level.dat")) {
                    return bufferEntry(zip, e).then(NBT.Serializer.deserialize).then((l) => {
                        result.level = l.Data as any;
                        if (result.level === undefined || result.level === null) {
                            throw {
                                error: "Corrupted Map",
                                entry: path.resolve(location, "level.dat"),
                                enabledFunctions: enabledFunction,
                                params: {
                                    entries,
                                },
                                result: l,
                            };
                        }
                    });
                }
                if (enabledFunction.players && e.fileName.match(/\/playerdata\/[0-9a-z\-]+\.dat$/)) {
                    return bufferEntry(zip, e).then(NBT.Serializer.deserialize).then((r) => { result.players.push(r as any); });
                }
                if (enabledFunction.advancements && e.fileName.match(/\/advancements\/[0-9a-z\-]+\.json$/)) {
                    return bufferEntry(zip, e).then((b) => b.toString()).then(JSON.parse).then((r) => { result.advancements.push(r as any); });
                }
                return undefined;
            });
        } else {
            const promises: Array<Promise<any>> = [];
            if (enabledFunction.level) {
                promises.push(fs.promises.readFile(path.resolve(location, "level.dat")).then(NBT.Serializer.deserialize).then((l) => {
                    result.level = l.Data as any;
                    if (result.level === undefined || result.level === null) {
                        throw {
                            error: "Corrupted Map",
                            entry: path.resolve(location, "level.dat"),
                            enabledFunctions: enabledFunction,
                            params: {
                                entries,
                            },
                            result: l,
                        };
                    }
                }));
            }
            if (enabledFunction.players) {
                promises.push(fs.promises.readdir(path.resolve(location, "playerdata")).then(
                    (files) => Promise.all(files.map((f) => path.resolve(location, "playerdata", f))
                        .map((p) => fs.promises.readFile(p)
                            .then(NBT.Serializer.deserialize).then((r) => { result.players.push(r as any); }),
                        )),
                    () => { },
                ));
            }
            if (enabledFunction.advancements) {
                promises.push(fs.promises.readdir(path.resolve(location, "advancements")).then(
                    (files) => Promise.all(files.map((f) => path.resolve(location, "advancements", f))
                        .map((p) => fs.promises.readFile(p)
                            .then((b) => b.toString()).then(JSON.parse).then((r) => { result.advancements.push(r as any); }),
                        )),
                    () => { },
                ));
            }
            await Promise.all(promises);
        }
        return result as any;
    }

    export function parseLevelData(buffer: Buffer) {
        const nbt = NBT.Serializer.deserialize(buffer, true);
        const data = nbt.Data;
        if (!data) { throw new Error("Illegal Level Data Content"); }
        return Object.keys(data).sort().reduce((r: any, k: any) => (r[k] = data[k], r), {});
    }
}

export default World;
