class CfgPatches {
    class SOG_Kneeboard {
        name = "SOG Kneeboard Integration";
        author = "SOG Development Team";
        url = "https://github.com/SingSongScreamAlong/sog-kneeboard";
        units[] = {};
        weapons[] = {};
        requiredVersion = 2.06;
        requiredAddons[] = {"A3_Data_F"};
        version = "1.0.0";
        versionStr = "1.0.0";
        versionAr[] = {1,0,0};
    };
};

class CfgFunctions {
    class SOG_Kneeboard {
        tag = "SOG_KB";
        class Functions {
            file = "\@SOG_Kneeboard\scripts";
            class init {
                postInit = 1;
            };
            class positionLoop {};
            class markerSync {};
            class sendPosition {};
            class readMarkers {};
            class getWorldMeta {};
        };
    };
};

class Extended_PostInit_EventHandlers {
    class SOG_Kneeboard_Init {
        init = "call SOG_KB_fnc_init";
    };
};
