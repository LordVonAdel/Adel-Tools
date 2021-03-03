import NodeEditor from "../src/NodeEditor.js";
import KVClass from "../src/KVClass.js"

class VMTTool extends Tool {

  constructor() {
    super({
      id: "vmt"
    });

    this.fileInput = this.addInput({
      label: "VMT File",
      type: "file",
      accept: ["vmt"]
    });

    this.fileInput.addEventListener("change", () => {
      this.importMaterial()
    });

    this.addTag("h3", {
      text: "Proxies"
    });

    this.nodeEditor = new NodeEditor();
    this.nodeEditor.registerNodes(ProxyNodes);
    this.nodeEditor.updateContextMenu([
      { name: "Calculation", items: ["Add", "Multiply", "Subtract", "Divide", "Abs", "Frac", "Int", "Clamp", "WrapMinMax", "Exponential", "Equals", "SelectFirstIfNonZero", "LessOrEqual"] },
      { name: "Number generation", items: ["Sine", "LinearRamp", "CurrentTime", "UniformNoise", "GaussianNoise", "MatrixRotate"] },
      { name: "Entity data access", items: ["Alpha", "Cycle", "PlayerProximity", "PlayerTeamMatch", "PlayerView", "PlayerSpeed", "PlayerPosition", "EntitySpeed", "EntityOrigin", "EntityRandom", "Health", "IsNPC", "WorldDims"] },
      { name: "Texture manipulation", items: ["AnimatedTexture", "AnimatedEntityTexture", "AnimatedOffsetTexture", "AnimateSpecificTexture", "Pupil", "TextureTransform", "TextureScroll", "LampBeam", "LampHalo", "CustomSteamImageOnModel"] },
      { name: "Entity integration", items: ["ToggleTexture"] },
      { name: "Utility", items: ["Empty", "Dummy"] },
      { name: "Miscellaneous", items: ["ConVar"] },
      { name: "Portal", items: ["PortalOpenAmount", "PortalStatic", "FizzlerVortex", "WheatlyEyeGlow", "Lightedmouth", "LightedFloorButton", "TractorBeam"] },
      { name: "Shaders", items: ["LightmappedGeneric", "UnlitGeneric", "VertexLitGeneric", "UnlitTwoTexture", "Water"] }
    ]);
    this.dom.appendChild(this.nodeEditor.dom);
  }

  async importMaterial() {
    this.showSpinner();
    let vmtText = (await this.bufferFromFileInput(this.fileInput)).toString();
    let parsed = KVClass.parse(vmtText);
    console.log(parsed);

    let proxies = parsed.getSubclassesByClassname("Proxies")[0];
    if (proxies) {
      let x = 0;
      for (let subclass of proxies.subclasses) {
        this.nodeEditor.spawnNode(subclass.classname, x);
        x += 256;
      }
    }

    this.hideSpinner();
  }
}

const VariableTypes = {
  Float: {
    color: "#00FF00"
  },
  Vector: {},
  Vector2: {},
  Texture: {},
  String: {},
  Matrix: {},
  Boolean: {},
  Material: {},
  Integer: {},
  RGB: {},
  Normal: {}
}

/**
 * https://developer.valvesoftware.com/wiki/List_Of_Material_Proxies
 */
const ProxyNodes = {
  // Calculation
  Add: {
    description: "Adds two variables.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float }, 
      { name: "srcVar2", type: VariableTypes.Float }
    ],
    out: [{name: "resultVar", type: VariableTypes.Float, alias: "Sum"}]
  },
  Multiply: {
    description: "Multiplies two variables.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float }, 
      { name: "srcVar2", type: VariableTypes.Float }
    ],
    out: [{name: "resultVar", type: VariableTypes.Float, alias: "Product"}]
  },
  Subtract: {
    description: "Subtracts the second variable from the first.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float }, 
      { name: "srcVar2", type: VariableTypes.Float }
    ],
    out: [{name: "resultVar", type: VariableTypes.Float, alias: "Difference"}]
  },
  Divide: {
    description: "Divides the first variable by the second.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float }, 
      { name: "srcVar2", type: VariableTypes.Float }
    ],
    out: [{name: "resultVar", type: VariableTypes.Float, alias: "Quotient"}]
  },
  Equals: {
    description: "Copies the value of a variable to another.",
    in: [
      { name: "srcVar1" }
    ],
    out: [
      { name: "resultVar" }
    ]
  },
  Abs: {
    description: "Computes the absolute (i.e. unsigned) value of a variable.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float }
    ],
    out: [
      { name: "resultVar", type: VariableTypes.Float }
    ]
  },
  Frac: {
    description: "Returns the fractional component of a variable.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float }
    ],
    out: [
      { name: "resultVar", type: VariableTypes.Float}
    ]
  },
  Int: {
    description: "Returns the integer component of a variable.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float }
    ],
    out: [{name: "resultVar", type: VariableTypes.Float}]
  },
  Clamp: {
    description: "Keeps a variable within a specified range.",
    in: [
      { name: "min", type: VariableTypes.Float },
      { name: "max", type: VariableTypes.Float },
      { name: "srcVar1", type: VariableTypes.Float }
    ],
    out: [{name: "resultVar", type: VariableTypes.Float}]
  },
  LessOrEqual: {
    description: "Compares the first value to the second.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float },
      { name: "srcVar2", type: VariableTypes.Float }
    ],
    out: [
      { name: "greaterVar", type: VariableTypes.Float },
      { name: "lessEqualVar", type: VariableTypes.Float },
      { name: "resultVar", type: VariableTypes.Float }
    ]
  },
  SelectFirstIfNonZero: {
    description: "Selects the first value over the second if it is anything other than zero.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float },
      { name: "srcVar2", type: VariableTypes.Float }
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float}
    ]
  },
  WrapMinMax: {
    description: "Constrains a value into a range, wrapping around if it exceeds it.",
    in: [
      { name: "srcVar1", type: VariableTypes.Float },
      { name: "minVal", type: VariableTypes.Float },
      { name: "maxVal", type: VariableTypes.Float }
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float}
    ]
  },
  Exponential: {
    in: [
      { name: "srcVar1", type: VariableTypes.Float },
      { name: "minVal", type: VariableTypes.Float },
      { name: "maxVal", type: VariableTypes.Float },
      { name: "offset", type: VariableTypes.Float },
      { name: "scale", type: VariableTypes.Float }
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float}
    ],
    description: "resultVar = scale * exp( srcVar1 + offset )"
  },
  // Number generation
  Sine: {
    description: "A sine wave.",
    in: [
      {name: "sineperiod", type: VariableTypes.Float, description: "Period between wave peaks, in seconds."}, 
      {name: "sinemin", type: VariableTypes.Float, description: "Value at the bottom of the wave."},
      {name: "sinemax", type: VariableTypes.Float, description: "Values at the top of the wave."},
      {name: "timeoffset", type: VariableTypes.Float, description: "Used to offset the starting position of the wave."}
    ],
    out: [
      { name: "resultVar", type: VariableTypes.Float }
    ]
  },
  LinearRamp: {
    description: "An ever-increasing float value.",
    in: [
      {name: "rate", type: VariableTypes.Float, description: "Units per second."}, 
      {name: "initialValue", type: VariableTypes.Float, description: "Value at map start."}
    ],
    out: [
      { name: "resultVar", type: VariableTypes.Float }
    ]
  },
  CurrentTime: {
    description: "The number of seconds the current map has been running on the server for.",
    in: [],
    out: [
      {name: "resultVar", type: VariableTypes.Float, description: "This is intended to set the $time shader variable, used by several shaders to adjust their effects over time."}
    ]
  },
  UniformNoise: {
    description: "A noisy signal where each value is equally likely to occur.",
    in: ["minVal", "maxVal"],
    out: [
      { name: "resultVar", type: VariableTypes.Float }
    ]
  },
  GaussianNoise: {
    description: "A noisy signal where values are biased towards the average.",
    in: [
      { name: "minVal", type: VariableTypes.Float },
      { name: "maxVal", type: VariableTypes.Float },
      { name: "mean", type: VariableTypes.Float },
      { name: "halfWidth", type: VariableTypes.Float }
    ],
    out: [
      { name: "resultVar", type: VariableTypes.Float }
    ]
  },
  MatrixRotate: {
    description: "A rotation matrix from the provided axis and angle.",
    in: [
      { name: "axisVar", type: VariableTypes.Vector, description: "Axis of rotation, in the format [x y z]", }, 
      { name: "angle", type: VariableTypes.Float, description: "Degrees of rotation around axis."}
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Matrix, description: "The result of this is a transformation matrix, suitable to set $basetexturetransform and other similar variables." }
    ]
  },
  // Entity Data Access
  Alpha: {
    in: [
      { name: "alpha", type: VariableTypes.Float }
    ],
    out: []
  },
  Cycle: {
    in: [
      {name: "start", type: VariableTypes.Float, description: "The value to output at the start of the animation. This can't be a variable reference."},
      {name: "end", type: VariableTypes.Float, description: "The value to output at the end of the animation. This can't be a variable reference."},
      {name: "easein", type: VariableTypes.Float, description: "Apply easing to the beginning of the output. This can't be a variable reference.."},
      {name: "easeout", type: VariableTypes.Float, description: "Apply easing to the beginning of the output. This can't be a variable reference."}
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float, description: "The variable to store the result in"}
    ]
  },
  PlayerProximity: {
    in: [
      {name: "scale", type: VariableTypes.Float, description: "The value is rescaled to be between 0 and the scale value."}
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float}
    ]
  },
  PlayerTeamMatch: {
    description: "Returns 1 if the team of the entity the material is applied to matches that of the local player. Used in TF2 for func_respawnroomvisualizer.",
    in: [],
    out: [
      {name: "resultVar", type: VariableTypes.Boolean}
    ]
  },
  PlayerView: {
    description: "The dot product of the player's view angle and the relative origin of the material's entity.",
    in: [
      {name: "scale", type: VariableTypes.Float, description: "The value is rescaled to be between 0 and the scale value."}
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float}
    ]
  },
  PlayerSpeed: {
    description: "Speed of the local player.",
    in: [
      {name: "scale", description: "The value is multiplied by this value", default: 0.005, type: VariableTypes.Float}
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float }
    ]
  },
  PlayerPosition: {
    description: "The local player's position",
    in: [
      {name: "scale", description: "The value is multiplied by this value", default: 0.005, type: VariableTypes.Float}
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Vector, alias: "Position"}
    ]
  },
  EntityOrigin: {
    description: "The material's entity's origin. The variable set cannot be changed.",
    in: [],
    out: {
      name: "$entityorigin",
      description: "Set to the origin of the entity.",
      type: VariableTypes.Vector
    }
  },
  EntityRandom: {
    description: "A static random number associated with the entity the material is applied to. Helpful for staggering effects that appear on multiple objects.",
    in: [
      {name: "scale", description: "The value is rescaled to be between 0 and the scale value.", default: 1, type: VariableTypes.Float}
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float}
    ]
  },
  Health: {
    description: "The material's entity's health (0-1).",
    in: [
      {name: "scale", description: "The value is rescaled to be between 0 and the scale value.", default: 1, type: VariableTypes.Float}
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float }
    ]
  },
  IsNPC: {
    description: "Returns whether the material is applied to a NPC. Used in HL2 for npc_hunter's eye glow, which is supposed to stay off on ragdolls.",
    in: [
      {name: "scale", default: 1, type: VariableTypes.Float, description: "The value to return when the material is applied to a NPC. Despite the name, nothing in this process is actually multiplied. (although this must be a float)."}
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Float, description: "If the material is applied to a NPC, this value is equal to scale. Otherwise, this value stays at 0."}
    ]
  },
  WorldDims: {
    description: "The dimensions of the world entity. The variables set cannot be changed.",
    in: [],
    out: [{
      name: "$world_mins",
      description: "Set to the minimum X/Y/Z coordinates.",
      type: VariableTypes.Vector
    }, {
      name: "$world_maxs",
      description: "Set to the maximum X/Y/Z coordinates.",
      type: VariableTypes.Vector
    }]
  },
  // Texture Manipulation
  AnimatedTexture: {
    description: "Increments the current frame of an animated VTF.",
    in: [
      { name: "animatedtexturevar", type: VariableTypes.Texture, description: "Texture to increment frame for. ( i.e. $basetexture, $bumpmap, $normalmap, $envmapmask, $detail)" },
      { name: "animatedtextureframerate", type: VariableTypes.Float, description: "Framerate in frames per second. Fixed; cannot be changed once set." }
    ],
    out: [
      { name: "animatedtextureframenumvar", type: VariableTypes.Integer, description: "Frame variable to increment. ( i.e. $frame, $bumpframe, $envmapmaskframe, $detailframe)" },
    ]
  },
  AnimatedEntityTexture: {
    description: `Identical to AnimatedTexture, except the entity controls when the animation starts and is "notified" when the animation is wrapped.`,
    in: [
      { name: "animatedtexturevar", type: VariableTypes.Texture, description: "Texture to increment frame for. ( i.e. $basetexture, $bumpmap, $normalmap, $envmapmask, $detail)" },
      { name: "animatedtextureframerate", type: VariableTypes.Float, description: "Framerate in frames per second. Fixed; cannot be changed once set." }
    ],
    out: [
      { name: "animatedtextureframenumvar", type: VariableTypes.Integer, description: "Frame variable to increment. ( i.e. $frame, $bumpframe, $envmapmaskframe, $detailframe)" },
    ]
  },
  AnimatedOffsetTexture: {
    description: `Identical to AnimatedTexture, except the animation begins when the entity it's applied to spawns.`,
    in: [
      { name: "animatedtexturevar", type: VariableTypes.Texture, description: "Texture to increment frame for. ( i.e. $basetexture, $bumpmap, $normalmap, $envmapmask, $detail)" },
      { name: "animatedtextureframerate", type: VariableTypes.Float, description: "Framerate in frames per second. Fixed; cannot be changed once set." }
    ],
    out: [
      { name: "animatedtextureframenumvar", type: VariableTypes.Integer, description: "Frame variable to increment. ( i.e. $frame, $bumpframe, $envmapmaskframe, $detailframe)" },
    ]
  },
  AnimateSpecificTexture: {
    description: `Identical to AnimatedTexture, except only the specified texture could be animated.`,
    in: [
      { name: "animatedtexturevar", type: VariableTypes.Texture, description: "Texture to increment frame for. ( i.e. $basetexture, $bumpmap, $normalmap, $envmapmask, $detail)" },
      { name: "animatedtextureframerate", type: VariableTypes.Float, description: "Framerate in frames per second. Fixed; cannot be changed once set." },
      { name: "onlyAnimateOnTexture", type: VariableTypes.String, description: "The full path for the texture that this proxy should function with." }
    ],
    out: [
      { name: "animatedtextureframenumvar", type: VariableTypes.Integer, description: "Frame variable to increment. ( i.e. $frame, $bumpframe, $envmapmaskframe, $detailframe)" },
    ]
  },
  Pupil: {
    description: "Used for character's eyes, computes the light brightness at the material's position and reacts to bright lights by incrementing the texture's frame.",
    in: [
      { name: "TextureVar", type: VariableTypes.Texture, description: "Texture to increment frame for." },,
      { name: "PupilCloseRate", type: VariableTypes.Float, description: "The maximum speed the pupil can close, in fractions/second.", default: 0.1 },
      { name: "PupilOpenRate", type: VariableTypes.Float, description: "The maximum speed the pupil can open, in fractions/second.", default: 0.03 },
      { name: "$lighting", type: VariableTypes.Texture, description: "This material variable is used to store the previous frame, and should be set to 0.5 in the material. It will be set to the average light value, from 0-1." }
    ],
    out: [
      { name: "TextureFrameNumVar", type: VariableTypes.Integer, description: "Frame variable to increment." },
    ]
  },
  TextureTransform: {
    description: "Generates a texture transform matrix for use with $basetexturetransform etc.",
    in: [
      // All of them are optional and can be float or Vector2D
      { name: "centerVar" },
      { name: "scaleVar" },
      { name: "rotateVar" },
      { name: "translateVar" }
    ],
    out: [
      {name: "resultVar", type: VariableTypes.Matrix}
    ]
  },
  TextureScroll: {
    description: "Returns a transform matrix or vector that will translate a texture at a given angle at a given rate.",
    in: [
      { name: "textureScrollRate", type: VariableTypes.Float, description: "Rate of scroll in units per second." },
      { name: "textureScrollAngle", type: VariableTypes.Float , description: "Angle of rotation to move along. (90 = up, 180 = left, etc)" }
    ],
    out: [
      { name: "textureScrollVar", type: VariableTypes.Matrix, description: "Destination for the resulting transformation." },
    ]
  },
  LampBeam: {
    description: "Modulates the material's alpha value based on angle between the beam's direction and the viewer's eye point. This is used to make the beams of volumetric light on lights fade as you look at them dead on. Must be attached to entity for angle use.",
    in: [],
    out: []
  },
  LampHalo: {
    description: "Modulates the material's alpha value based on angle between the beam's direction and the viewer's eye point. Like the LampBeam proxy, but used for the halo at the beam's base. Must be attached to entity for angle use.",
    in: [],
    out: []
  },
  CustomSteamImageOnModel: {
    description: "Replaces the $baseTexture with a custom texture. No parameters.",
    in: [],
    out: []
  },
  // Entity integration
  /**
   * @Todo MaterialModify / MaterialModifyAnimated, WaterLOD, BreakableSurface, Camo, FleshInterior, HeliBlade, ParticleSphereProxy, PlayerLogo, Shadow, ShadowModel
   */
  ConveyorScroll: {
    description: "Returns the scroll parameters for a texture used as a conveyor, so it matches the entity's settings. Must be attached to func_conveyor entity.",
    out: [
      {name: "textureScrollVar", type: VariableTypes.Float, description: "Must be a matrix or vector type variable (i.e. $baseTextureOffset).", alias: "Scroll Amount"}
    ]
  },
  ToggleTexture: {
    description: "Toggles a texture based on the frame number set by env_texturetoggle. Must be attached to an entity.",
    in: [
      { name: "toggleTextureVar", description: "Texture to modify based on frames.", type: VariableTypes.Texture },
      { name: "toggleTextureFrameNumVar", description: "Variable used for frame number.", type: VariableTypes.String, default: "$frame"},
      { name: "toggleShouldWrap", description: "Whether the animation should wrap over not.", type: VariableTypes.Boolean },
    ],
    out: []
  },
  // Utility
  Dummy: {
    	description: "Prints developer messages in response to the proxy being created, the proxy being initialized, the proxy being bound to an entity, and the proxy being removed.",
      in: [],
      out: []
  },
  // Miscellaneous
  ConVar: {
    description: "Allows you to link a specific variable to a ConVar a client has set.",
    in: [
      { name: "convar", type: VariableTypes.String, description: `The ConVar name to link to. ( E.G. "mat_specular" )`}
    ],
    out: [
      { name: "resultVar", type: VariableTypes.Float, description: "Returns the value of the ConVar. If this is a vector type, all axes will be set individually to the ConVar's value." }
    ]
  },
  // Portal 1 and 2
  PortalOpenAmount: {
    description: "On portals, transitions from 0 to 1 as the portal opens.",
    in: [],
    out: [
      { name: "resultVar", type: VariableTypes.Float } 
    ]
  },
  PortalStatic: {
    description: "On portals, specifies how much the opaque static effect should render. 1 is a unpaired portal, 0 is an open portal.",
    in: [],
    out: [
      { name: "resultVar", type: VariableTypes.Float } // Should this be in?
    ]
  },
  // Portal 2
  FizzlerVortex: {
    description: "Sets various parameters used by the SolidEnergy shader for fizzler effects - the location of nearby objects, flashing from portal shots, and power transition times. Doesn't take any arguments.",
    in: [],
    out: [
      { name: "$powerup", type: VariableTypes.Float, description: "Transitions to 0 when the fizzler is turned off, 1 when turned on." },
      { name: "$FLOW_VORTEX1", type: VariableTypes.Float, description: "Set to 1 when an object is brought near the field, otherwise set to 0."  },
      { name: "$FLOW_VORTEX_POS1", type: VariableTypes.Vector, description: "Set to the position of the first object."  },
      { name: "$FLOW_VORTEX2", type: VariableTypes.Float, description: "Set to 1 when a second object is brought near the field, otherwise set to 0."  },
      { name: "$FLOW_VORTEX_POS2", type: VariableTypes.Vector, description: "Set to the position of the second object."  },
    ]
  },
  WheatlyEyeGlow: {
    description: "Presumably controls the glow effect on Wheatley. Not actually used.",
    in: [],
    out: []
  },
  Lightedmouth: {
    description: "Used on the various Personality Cores and PoTaTOS to blink their eye-light in sync with their choreo scenes. When idle, the tint is still partially lit. On the viewmodel, it can also be manually controlled via VScript to make GLaDOS appear to shut down.",
    in: [],
    out: [
      { name: "resultVar", description: "A tint to pass to $selfillumtint" }
    ]
  },
  LightedFloorButton: {
    description: "Used on the clean Super Button materials, sets selfillumtint depending on the pressed state. Somewhat useless, since the model swaps skins at this point and it could just have hardcoded the two values.",
    in: [],
    out: [
      { name: "resultVar", type: VariableTypes.Vector, description: "The tint to use, or [0 0 0] if not on a button." }
    ]
  },
  TractorBeam: {
    description: "Used on the Excursion Funnel effect materials, outputs the scroll rate and does other unknown operations.",
    in: [],
    out: [
      { name: "resultVar", type: VariableTypes.Float, description: "Passed to the textureScrollRate parameter of various TextureScroll proxies." }
    ]
  },
  // Shaders
  /**
   * https://developer.valvesoftware.com/wiki/Category:Shaders
   */
  LightmappedGeneric: {
    description: "LightmappedGeneric is a material shader available in all Source games. It is the shader most commonly used to render brushes, displacements and lightmapped surfaces.",
    in: [
      { name: "$basetexture", type: VariableTypes.Texture },
      { name: "$surfaceprop", type: VariableTypes.String },

      { name: "$bumpmap" },
      { name: "$ssbump" },
      { name: "$color" },
      { name: "$decal" },
      { name: "$detail" },
      { name: "$distancealpha" },
      { name: "$envmap" },
      { name: "$lightwarptexture" },
      { name: "$seamless_scale" },
      { name: "$selfillum" },
      { name: "$translucent" },
      { name: "$alpha" },
      { name: "$alpha" }
    ],
    out: []
  },
  UnlitGeneric: {
    description: "UnlitGeneric draws an albedo without standard lighting passes. It is used for things like UI images, pure white, and pitch blackness, but also in situations when software lighting is used (like on detail props). It accepts only the most rudimentary of VMT commands.",
    in: [
      { name: "$basetexture", type: VariableTypes.Texture },
      { name: "$surfaceprop", type: VariableTypes.String },
      { name: "$alpha" },
      { name: "$translucent" },
      { name: "$detail" },
      { name: "$outline" },
      { name: "$singlepassflashlight" },
      { name: "$receiveflashlight" }
    ],
    out: []
  },
  UnlitTwoTexture: {
    in: [
      { name: "$basetexture", type: VariableTypes.Texture },
      { name: "$surfaceprop", type: VariableTypes.String },
      { name: "$texture2", type: VariableTypes.Texture },
      { name: "$model" },
      { name: "$nocull" },
      { name: "$additive" }
    ],
    out: []
  },
  VertexLitGeneric: {
    description: "VertexLitGeneric is a material shader available in all Source games. It is the shader most commonly used to render models, and supports a variety of effects.",
    in: [
      { name: "$basetexture", type: VariableTypes.Texture },
      { name: "$surfaceprop", type: VariableTypes.String },

      { name: "$bumpmap" },
      { name: "$detail" },
      { name: "$envmap" },
      { name: "$emissiveblend" },
      { name: "$flesh" },
      { name: "$halflambert" },
      { name: "$lightwarptexture" },
      { name: "$phong" },
      { name: "$rimlight" },
      { name: "$selfillum" },
      { name: "$translucent" },
      { name: "$alpha" },
      { name: "$compress" },
      { name: "$stretch" },
      { name: "$treeSway" },
      { name: "$flashlightnolambert", type: VariableTypes.Boolean },
      { name: "$seperatedetailuvs", type: VariableTypes.Boolean },
      { name: "$desaturatewithbasealpha", type: VariableTypes.Float },
      { name: "$lowqualityflashlightshadows", type: VariableTypes.Boolean },
      { name: "$cloakpassenabled", type: VariableTypes.Boolean },
      { name: "$cloakfactor", type: VariableTypes.Normal },
      { name: "$cloakcolortint", type: VariableTypes.RGB },
      { name: "$refractamount", type: VariableTypes.Float }
    ],
    out: []
  },
  Water: {
    description: "Water is a material shader available in all Source games. It creates water that realistically reflects and refracts the world, and that can flow throughout a map.",
    in: [
      { name: "$basetexture", type: VariableTypes.Texture },
      { name: "$abovewater", type: VariableTypes.Boolean},
      { name: "$bottommaterial", type: VariableTypes.Material },
      { name: "$underwateroverlay", type: VariableTypes.Material },
      { name: "$bumpmap", type: VariableTypes.Texture },
      { name: "$normalmap", type: VariableTypes.Texture },
      { name: "$dudvframe", type: VariableTypes.Integer },
      { name: "$bumpframe", type: VariableTypes.Integer },
      { name: "$bumptransform", type: VariableTypes.Matrix },
      { name: "$scale", type: VariableTypes.Vector2 },
      { name: "$flashlighttint", type: VariableTypes.Float },
      { name: "$waterdepth", type: VariableTypes.Float },
      { name: "$depth_feather", type: VariableTypes.Integer },
      { name: "$fogenable", type: VariableTypes.Boolean },
      { name: "$fogcolor", type: VariableTypes.RGB },
      { name: "$fogstart", type: VariableTypes.Float },
      { name: "$fogend", type: VariableTypes.Float },
      { name: "$lightmapwaterfog", type: VariableTypes.Boolean },
      { name: "$reflecttexture", type: VariableTypes.Texture },
      { name: "$reflectamount", type: VariableTypes.Float },
      { name: "$reflecttint", type: VariableTypes.RGB },
      { name: "$envmap", type: VariableTypes.Texture },
      { name: "$envmapframe", type: VariableTypes.Integer },
      { name: "$forceenvmap", type: VariableTypes.Boolean },
      { name: "$forcecheap", type: VariableTypes.Boolean },
      { name: "$forceexpensive", type: VariableTypes.Boolean },
      { name: "$cheapwaterstartdistance", type: VariableTypes.Float },
      { name: "$cheapwaterenddistance", type: VariableTypes.Float },
      { name: "$reflectentities", type: VariableTypes.Boolean },
      { name: "$reflectonlymarkedentities", type: VariableTypes.Boolean },
      { name: "$reflectskyboxonly", type: VariableTypes.Boolean },
      { name: "$reflect2dskybox", type: VariableTypes.Boolean },
      { name: "$reflectblendfactor", type: VariableTypes.Float },
      { name: "$nofresnel", type: VariableTypes.Float },
      { name: "$forcefresnel", type: VariableTypes.Float },
      { name: "$basereflectance", type: VariableTypes.Float },
      { name: "$maxreflectance", type: VariableTypes.Float },
      { name: "$refract", type: VariableTypes.Boolean },
      { name: "$refracttexture", type: VariableTypes.Texture },
      { name: "$refractamount", type: VariableTypes.Float },
      { name: "$refracttint", type: VariableTypes.RGB },
      { name: "$blurrefract", type: VariableTypes.Boolean},
      { name: "$pseudotranslucent", type: VariableTypes.Boolean },
      { name: "$waterblendfactor", type: VariableTypes.Normal },
      { name: "$scroll1", type: VariableTypes.Vector2 },
      { name: "$scroll2", type: VariableTypes.Vector2 },
      { name: "$flowmap", type: VariableTypes.Texture },
      { name: "$flow_normaluvscale", type: VariableTypes.Float },
      { name: "$flow_worlduvscale", type: VariableTypes.Float },
      { name: "$flow_uvscrolldistance", type: VariableTypes.Float },
      { name: "$flow_timeintervalinseconds", type: VariableTypes.Float },
      { name: "$flow_timescale", type: VariableTypes.Float },
      { name: "$flow_bumpstrength", type: VariableTypes.Normal },
      { name: "$flow_noise_texture", type: VariableTypes.Texture },
      { name: "$flow_noise_scale", type: VariableTypes.Float },
      { name: "$flow_debug", type: VariableTypes.Boolean },
      { name: "$color_flow_uvscale", type: VariableTypes.Float },
      { name: "$color_flow_timescale", type: VariableTypes.Float },
      { name: "$color_flow_timeintervalinseconds", type: VariableTypes.Float },
      { name: "$color_flow_uvscrolldistance", type: VariableTypes.Float },
      { name: "$color_flow_lerpexp", type: VariableTypes.Float },
      { name: "$color_flow_displacebynormalstrength", type: VariableTypes.Float },
      { name: "%compilewater", type: VariableTypes.Boolean },
      { name: "$surfaceprop" },
      { name: "%tooltexture", type: VariableTypes.Texture },
    ],
    out: []
  }
}

new VMTTool();