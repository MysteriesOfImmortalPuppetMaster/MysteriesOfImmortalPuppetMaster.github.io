# Naming mismatch report

Scope: all 1,044 files in `chapters/` (35 chunks of up to 30 chapters). Reference: `MOIP_glossary.txt` (working copy).

**How this was produced.** A script pass found candidate names and near-spellings across the whole book. 34 of 35 Haiku workers then scanned a chunk each and listed names that appear under 2+ renderings. A final script re-counted every reported form across the *entire* book (whole-word, case-sensitive, footnote text excluded) and dropped any form that does not occur. Counts below are those whole-book counts.

**Coverage caveats.**
- Chunk 11 (chapters 296-325) has no worker output file; its section comes from the worker's written report (23 candidates), re-verified by whole-book grep.
- Many workers (all of chunks 3, 15, 16, 22, 25-35, and others) scanned with scripts (capitalized-phrase extraction, near-duplicate detection, grep) instead of reading every line, so a purely semantic variant with no spelling overlap can be missed. Spelling/spacing/typo variants are covered book-wide by the script pass.
- Whether two *different-looking* names are the same entity (e.g. Ning Xiaoren vs Ning Xiaohui, Cheng Bai vs Qi Bai) was judged by workers from context and is marked as such; confirm against the Chinese before changing.
- Section 1 has since been applied to `chapters/` (1,279 replacements in 328 files, footnote lines skipped); the counts in section 1 below are the BEFORE state. Held back and still present: both ape names and armor names, Tie Zheng, Life Thread, Ten Thousand Li Dragon, Fire Persimmon City, Da Sheng, Rising Cloud Trial, Essence Sea, Two Note Nation, Divine Constabulary/Hunter, Sang Le Youling, Third General Camp, standalone Buddha Doctor/Physician/Healer. After this report was generated, the glossary description column was updated with the accepted alternates (Dasheng, Mechanical Ape, Ning Family, Country forms, mechanical ring, Lord of the Forgetful River); the counts below predate that and still list them as variants.

## 1. Conflicts with the glossary and high-impact splits

Format: `form` count x (chapter range). The glossary form is marked **[glossary]**. Forms with 0 occurrences are omitted.

### Ten Thousand-Li Traversing Dragon (mechanical dragon)
- `Ten Thousand Li Traversing Dragon`: 183x, 65 chapters (ch 299-724)
- `Ten Thousand Li Dragon`: 63x, 17 chapters (ch 340-572)
- `Ten Thousand-Li Traversing Dragon` **[glossary]**: 35x, 20 chapters (ch 578-984)
- `Ten Thousand Miles`: 16x, 7 chapters (ch 342-824)
- `Ten Thousand Mile Soaring Dragon`: 9x, 2 chapters (ch 335-360)
- `Myriad Li Wandering Dragon`: 8x, 2 chapters (ch 344-345)
- `Ten Thousand Li Wandering Dragon`: 5x, 2 chapters (ch 409-486)
- `Ten Thousand Li Flying Dragon`: 4x, 2 chapters (ch 404-411)
- `Myriad-Mile Dragon`: 3x, 1 chapters (ch 351-351)

### Yuan Dasheng's mechanical ape body
- `Golden Blood Battle Ape`: 252x, 64 chapters (ch 82-354)
- `Golden Blood Battle Ape Dasheng`: 131x, 43 chapters (ch 82-349)
- `Tree Martial Ape`: 60x, 20 chapters (ch 121-199)
- `Heavy Armored Blood Ape`: 31x, 18 chapters (ch 317-1013)
- `Mechanical Ape`: 23x, 11 chapters (ch 136-291)
- `Golden Blood Battle Ape Da Sheng`: 22x, 7 chapters (ch 142-151)
- `Heavy Armored Blood Ape - Dasheng` **[glossary]**: 19x, 12 chapters (ch 328-1013)
- `Tree Martial Battle Ape`: 10x, 1 chapters (ch 118-118)
- `Heavy Armored Blood Ape Dasheng`: 6x, 2 chapters (ch 320-694)

### Yuan Dasheng (name)
- `Dasheng`: 1474x, 208 chapters (ch 53-1014) - this is probably fine.
- `Yuan Dasheng` **[glossary]**: 1157x, 181 chapters (ch 53-1014)
- `Da Sheng`: 107x, 23 chapters (ch 57-504)
- `Yuan Da Sheng`: 18x, 3 chapters (ch 110-504)

### Ning Zhuo's armor
- `Black Iron Han Armor` **[glossary]**: 26x, 12 chapters (ch 658-930)
- `Iron Will Gray Armor`: 23x, 12 chapters (ch 1-77)
- `Azure Iron Han Armor`: 16x, 4 chapters (ch 514-693)
- `Blue Iron Armor`: 16x, 5 chapters (ch 123-136)
- `Blue Azure Iron Armor`: 10x, 3 chapters (ch 137-640)

### Embryonic Breath Spirit Boat
- `Embryonic Breath Spirit Boat` **[glossary]**: 89x, 36 chapters (ch 405-867)
- `Fetal Breath Spiritual Boat`: 31x, 4 chapters (ch 432-499)
- `Fetal Breath Spirit Boat`: 21x, 12 chapters (ch 425-536)
- `Fetal Breathing Spiritual Boat`: 6x, 1 chapters (ch 429-429)
- `Fetal Breathing Spirit Boat`: 3x, 2 chapters (ch 381-516)
- `Embryonic Breath Spirit Barge`: 1x, 1 chapters (ch 360-360)

### Mirror Platform manual
- `Mirror Platform Spirit Communication Technique`: 33x, 25 chapters (ch 123-612)
- `Mirror Platform Spirit Communication Manual` **[glossary]**: 19x, 17 chapters (ch 657-998)
- `Mirror Platform Spirit Communication Incantation`: 15x, 9 chapters (ch 50-100)
- `Mirror Platform Communion Sutra`: 1x, 1 chapters (ch 321-321)

### Cremation sutra
- `Fire Burial Prajna Spirit Unbinding Sutra`: 27x, 15 chapters (ch 104-433)
- `Cremation Prajna Spirit Release Sutra` **[glossary]**: 17x, 11 chapters (ch 632-1014)
- `Cremation of Brahma Sutra`: 1x, 1 chapters (ch 321-321)

### Demonic blood art
- `Demonic Blood Vein Technique`: 113x, 52 chapters (ch 102-621)
- `Demonic Contamination Blood Meridian Art` **[glossary]**: 65x, 29 chapters (ch 686-1014)
- `Demonic Pollution Blood Sinew Technique`: 23x, 9 chapters (ch 50-100)
- `Demonic Pollution Blood Muscle Technique`: 2x, 1 chapters (ch 67-67)

### City Lord's Mansion
- `City Lord's Mansion` **[glossary]**: 360x, 105 chapters (ch 103-813)
- `City Lord Mansion`: 66x, 36 chapters (ch 5-331)

### Life Hanging by a Thread (technique)
- `Life Hanging by a Thread` **[glossary]**: 363x, 165 chapters (ch 102-1020)
- `Life Thread`: 33x, 20 chapters (ch 106-600)
- `Life-Hanging Thread`: 30x, 15 chapters (ch 24-746)
- `Life Hanging Thread`: 3x, 3 chapters (ch 393-622)

### Tie Guzheng
- `Tie Zheng`: 200x, 16 chapters (ch 749-917)
- `Tie Guzheng` **[glossary]**: 115x, 20 chapters (ch 582-647)
- `Tie Guezheng`: 1x, 1 chapters (ch 609-609)

### Meng Yaoyin's title
- `Buddhist Doctor - Meng Yaoyin` **[glossary]**: 111x, 21 chapters (ch 328-913)
- `Buddhist Doctor Meng Yaoyin`: 53x, 25 chapters (ch 406-879)
- `Buddha Doctor - Meng Yaoyin`: 21x, 2 chapters (ch 630-632)
- `Buddhist Physician Meng Yaoyin`: 14x, 4 chapters (ch 419-694)
- `Buddhist Healer Meng Yaoyin`: 7x, 4 chapters (ch 330-545)
- `Buddha Doctor Meng Yaoyin`: 5x, 2 chapters (ch 324-559)
- `Bhudda Doctor - Meng Yaoyin`: 3x, 1 chapters (ch 631-631)

### Divine Constable (title)
- `Divine Constable` **[glossary]**: 49x, 32 chapters (ch 120-708)
- `Divine Investigator`: 13x, 9 chapters (ch 55-398)
- `Divine Constabulary`: 2x, 2 chapters (ch 134-324)
- `Divine Hunter`: 1x, 1 chapters (ch 143-143)

### Divine sea
- `divine sea` **[glossary]**: 276x, 143 chapters (ch 29-1026)
- `Divine Sea`: 84x, 49 chapters (ch 120-976)
- `Essence Sea`: 53x, 29 chapters (ch 124-973)

### Three Generals Camp
- `Three Generals Camp` **[glossary]**: 238x, 48 chapters (ch 421-695)
- `Three Generals Battalion`: 128x, 24 chapters (ch 422-565)
- `Three Generals' Camp`: 74x, 14 chapters (ch 424-568)
- `Three-Generals Camp`: 31x, 6 chapters (ch 468-546)
- `Three General Camp`: 29x, 5 chapters (ch 474-545)
- `Third General Camp`: 10x, 2 chapters (ch 435-494)

### Red Flower Camp
- `Red Flower Camp` **[glossary]**: 241x, 52 chapters (ch 418-808)
- `Red Flower Battalion`: 81x, 26 chapters (ch 422-591)
- `Redflower Battalion`: 9x, 1 chapters (ch 476-476)

### Demonic Cultivator
- `Demon Cultivator`: 237x, 59 chapters (ch 120-958)
- `Demonic Cultivator` **[glossary]**: 116x, 57 chapters (ch 73-1028)

### Qi Refining (realm)
- `Qi Refining`: 450x, 226 chapters (ch 3-997)
- `Qi Refining Stage` **[glossary]**: 142x, 86 chapters (ch 121-914)
- `Qi Refinement`: 24x, 15 chapters (ch 101-752)

### Soul Formation (realm)
- `Soul Formation` **[glossary]**: 283x, 118 chapters (ch 203-1023)
- `Soul Transformation`: 5x, 5 chapters (ch 217-652)

### Void Refinement (realm)
- `Void Refinement` **[glossary]**: 32x, 24 chapters (ch 203-1003)
- `Void Refining`: 24x, 21 chapters (ch 39-781)

### Ning Clan
- `Ning Clan` **[glossary]**: 408x, 86 chapters (ch 1-1025)
- `Ning Family`: 106x, 34 chapters (ch 110-567)

### Two Note Kingdom
- `Two Note Kingdom` **[glossary]**: 171x, 71 chapters (ch 430-984)
- `Two Note Nation`: 161x, 38 chapters (ch 434-569)
- `Two Note Country`: 79x, 18 chapters (ch 421-587)
- `Two Notes Country`: 19x, 5 chapters (ch 408-506)
- `Two Notes Kingdom`: 16x, 7 chapters (ch 409-586)
- `Two-Note Nation`: 11x, 1 chapters (ch 495-495)

### Southern Bean Kingdom
- `Southern Bean Kingdom` **[glossary]**: 277x, 124 chapters (ch 15-781)
- `Southern Bean Country`: 25x, 12 chapters (ch 128-566)
- `South Bean Kingdom`: 6x, 3 chapters (ch 393-565)
- `Southern Bean Immortal Kingdom`: 5x, 5 chapters (ch 39-133)
- `Southern Bean Dynasty`: 2x, 2 chapters (ch 112-125)

### Flying Cloud Kingdom
- `Flying Cloud Kingdom` **[glossary]**: 200x, 99 chapters (ch 100-1014)
- `Feiyun Country`: 1x, 1 chapters (ch 324-324)

### Fire Persimmon Immortal City
- `Fire Persimmon Immortal City` **[glossary]**: 580x, 280 chapters (ch 1-1013)
- `Fire Persimmon City`: 46x, 26 chapters (ch 15-373)

### Thousand Peaks Forest
- `Thousand Peaks Forest` **[glossary]**: 407x, 120 chapters (ch 408-977)
- `Thousand Peak Forest`: 39x, 14 chapters (ch 520-593)
- `Ten Thousand Peaks Forest`: 27x, 6 chapters (ch 408-689)

### Rising Cloud Minor Trial
- `Rising Cloud Minor Trial` **[glossary]**: 253x, 99 chapters (ch 697-1028)
- `Rising Cloud Trial`: 55x, 18 chapters (ch 716-805)
- `Flying Cloud Minor Trial`: 27x, 7 chapters (ch 702-708)
- `Rising Clouds Minor Trial`: 20x, 6 chapters (ch 770-833)

### Flying Cloud Assembly
- `Flying Cloud Assembly` **[glossary]**: 180x, 107 chapters (ch 588-1028)
- `Flying Cloud Grand Assembly`: 7x, 2 chapters (ch 735-744)
- `Soaring Cloud Assembly`: 4x, 3 chapters (ch 618-763)

### Sun-Supporting altar
- `Sun-Supporting Yang-Locking Cloud Ascending Altar` **[glossary]**: 152x, 36 chapters (ch 954-1025)
- `Sun-Supporting Yang-Locking Cloud Ascension Altar`: 43x, 7 chapters (ch 941-950)
- `Sun-Supporting Yang-Locking Cloud-Ascending Altar`: 4x, 2 chapters (ch 942-947)

### Yin-Yang One Qi Kettle
- `Yin-Yang One Qi Kettle` **[glossary]**: 24x, 14 chapters (ch 480-983)
- `Yinyang One Qi Kettle`: 16x, 2 chapters (ch 461-462)
- `YinYang One Qi Kettle`: 7x, 3 chapters (ch 465-514)

### Buddha Heart Demon Seal
- `Buddha Heart Demon Seal` **[glossary]**: 252x, 117 chapters (ch 1-973)
- `My Buddha Heart Demon Seal`: 18x, 7 chapters (ch 111-780)
- `Buddha-Heart Demon Seal`: 9x, 5 chapters (ch 663-733)
- `Buddha Heart Devil Seal`: 5x, 2 chapters (ch 110-360)
- `Buddha's Heart Demon Seal`: 5x, 5 chapters (ch 346-425)

### Mechanism Ring
- `Mechanism Ring` **[glossary]**: 59x, 30 chapters (ch 514-1021)
- `mechanical ring`: 26x, 18 chapters (ch 278-620)
- `mechanical finger ring`: 7x, 2 chapters (ch 520-589)

### Forgetful River Prefecture Lord
- `Forgetful River Prefecture Lord` **[glossary]**: 457x, 77 chapters (ch 597-1014)
- `Lord of the Forgetful River`: 34x, 9 chapters (ch 593-850)
- `Lord Wangchuan`: 14x, 4 chapters (ch 650-666)

### Sorrowful Melody Ghost Seer
- `Sorrowful Melody Ghost Seer` **[glossary]**: 128x, 26 chapters (ch 567-695)
- `Sang Le Youling`: 57x, 5 chapters (ch 582-588)
- `Lady of Sorrowful Bones`: 23x, 4 chapters (ch 627-652)

### Snow-Colored Maiden Hui
- `Snow-Colored Maiden Hui` **[glossary]**: 208x, 36 chapters (ch 695-1014)
- `Snow-Colored Lady Hui`: 14x, 2 chapters (ch 694-699)
- `Snow Maiden Hui`: 9x, 2 chapters (ch 698-700)

### Meng Yehu
- `Meng Yehu` **[glossary]**: 175x, 46 chapters (ch 349-1014)
- `Meng Yegu`: 1x, 1 chapters (ch 512-512)

## 2. Spelling, spacing, hyphenation and typo variants

Same name, minor differences. The first form listed is the most frequent. Single-occurrence forms are most likely typos.


### character

- `Ning Zhuo` (29149x) / `Ningzhuo` (2x) / `Nign Zhuo` (1x)  [glossary: `Ning Zhuo`]
- `Sun Lingtong` (4793x) / `Sun Ling Tong` (2x) / `Sun Lingdong` (1x)
- `Zhu Xuanji` (2527x) / `Zhu Xuangji` (8x) / `Zhu Xuan Ji` (2x)
- `Chunyangzi` (1049x) / `Chun Yangzi` (51x)  [glossary: `Chunyangzi`]
- `Qing Chi` (1059x) / `Qingchi` (4x)  [glossary: `Qing Chi`]
- `Ning Jiufan` (885x) / `Ning Jufan` (27x) / `Ning Jiu Fan` (5x)
- `Fei Si` (716x) / `Fei Shi` (1x)
- `Ning Xiaohui` (685x) / `NIng Xiaohui` (5x) / `Ning Xiahui` (3x) / `Ning Xioahui` (1x)
- `Lin Shanshan` (574x) / `Lin Shan Shan` (10x)
- `Lin Bufan` (531x) / `Lin Bu Fan` (10x)
- `Fenxiang` (500x) / `Fanxiang` (26x)
- `Red-Robed Guest` (480x) / `Red Robe Guest` (33x) / `Red Robed Guest` (9x)
- `Ning Xiaoren` (491x) / `Ning Xiao Ren` (7x) / `Ning Xiao'e` (2x)
- `Meng Yaoyin` (488x) / `Meng Yao Yin Yue` (1x)  [glossary: `Meng Yaoyin`]
- `Zhu Fenxiang` (463x) / `Zhu Fanxiang` (13x)  [glossary: `Zhu Fenxiang`]
- `Shuang Jing` (375x) / `Shuangjing` (83x)  [glossary: `Shuang Jing`]
- `Linghu Jiu` (426x) / `Ling Hu Jiu` (2x)
- `Nine Fires Dragon Lord` (236x) / `Nine Fire Dragon Lord` (88x) / `Nine-Fire Dragon Lord` (16x)
- `Han Zhou` (330x) / `Hanzhou` (4x)
- `Zhou Zeshen` (257x) / `Zhou Zeshan` (31x) / `Zhou Zesheng` (30x) / `Zhoug Zeshen` (1x) / `Zhou Ze Shen` (1x)
- `Zhang Zhongyi` (214x) / `Zhang Chongyi` (105x)
- `Tian Shuang` (290x) / `Tianshuang` (1x)
- `Lu Hongtu` (256x) / `Lu Hong` (18x)
- `Kong Ran` (264x) / `Kongran` (6x)
- `Qing Yan` (239x) / `Qingyan` (10x)
- `Hua Guzi` (228x) / `Hua Gui` (19x)
- `Chu Xuangui` (192x) / `Zhu Xuangui` (12x) / `Chu Xuangu` (4x)
- `Qing Huangzi` (180x) / `Qinghuangzi` (20x)
- `Buddhist Doctor - Meng Yaoyin` (111x) / `Buddhist Doctor Meng Yaoyin` (53x) / `Buddha Doctor - Meng Yaoyin` (21x) / `Buddha Doctor Meng Yaoyin` (5x) / `Bhudda Doctor - Meng Yaoyin` (3x)
- `Meng Yehu` (175x) / `Meng Yèhu` (2x) / `Meng Yegu` (1x)  [glossary: `Meng Yehu`]
- `Ning Chen` (169x) / `Ning Chehn` (1x) / `Nign Chen` (1x)
- `Zheng Shuangjun` (160x) / `Zheng Shuangou` (5x) / `Zheng Shuangdiao` (1x) / `Zheng Shuang` (1x)
- `Zheng Shuangjun` (160x) / `Zheng Shuangou` (5x)
- `Cang Yazi` (118x) / `Cangyazi` (24x)
- `Zhongli Mei` (95x) / `Zhong Limei` (43x)
- `Twin Ghosts of Heaven and Earth` (99x) / `Twin ghosts of Heaven and Earth` (16x) / `Two Ghosts of Heaven and Earth` (12x)
- `Tie Guzheng` (115x) / `Tie Guezheng` (1x)  [glossary: `Tie Guzheng`]
- `Heavenly Ghost` (109x) / `Heaven Ghost` (1x)
- `Shen Lingshu` (92x) / `Shen Ling Shu` (4x)
- `Di Hui` (83x) / `Dihu` (5x)
- `Demon Heart Cave Master` (61x) / `Demonheart Cave Master` (11x) / `Demonic Heart Cave Master` (4x)
- `Zheng Shuanggou` (62x) / `Zheng Shuaggou` (1x)
- `Sheng Xu` (31x) / `Shengxu` (27x)
- `Lu Xu'an` (40x) / `Lu Xuan` (17x)
- `Bi Tengyi` (50x) / `Bitengyi` (2x) / `Bi Teng Yi` (1x)
- `Blood Shadow Cave Master` (46x) / `Bloodshadow Cave Master` (3x)
- `Wu Lan` (42x) / `Wulan` (7x)
- `Heaven and Earth Twin Ghosts` (32x) / `Heavenly and Earthly Twin Ghosts` (7x) / `Heaven-Earth Twin Ghosts` (6x)
- `Wenren Yan` (26x) / `Wen Renyan` (16x)
- `Li Jiǔqu` (23x) / `Li Jiuqu` (18x)
- `Three Schools Supreme Sage` (33x) / `Three School Supreme Sage` (1x)
- `Mo Yecheng` (22x) / `Mo Yechen` (12x)
- `Yin Changgeng` (27x) / `Yin Changgang` (5x)
- `Buddhist Physician` (18x) / `Buddha Physician` (11x)
- `Qing Baizi` (23x) / `Qingbaizi` (6x)
- `Red Sleeve Fairy` (22x) / `Red-sleeve Fairy` (1x)
- `Divine Investigator` (13x) / `Divine Investigator Zhu` (8x)
- `Demon Heart Cavern Lord` (14x) / `Demon Heart Cave Lord` (5x) / `Demon-Heart Cave Lord` (1x)
- `Mountain Master` (16x) / `Mountain Peak Master` (2x)
- `Zhang Huaixu` (10x) / `Zhang Huaiyu` (6x)
- `Qing'er` (13x) / `Qing-er` (2x)
- `Jingyu` (8x) / `Jingyue` (5x)
- `Jade Immortal Princess` (10x) / `Still Jade Immortal Princess` (2x)
- `Chui Can Ke` (10x) / `Chui Zan Ke` (2x)
- `Qian Ye` (5x) / `Qianye` (4x)
- `Jin Zi` (6x) / `Jinzi` (3x)
- `Buddhist Healer Meng Yaoyin` (7x) / `Buddhist Healer - Meng Yaoyin` (1x)
- `Golden Hairpin Crone` (4x) / `Golden Hairpin Old Crone` (3x)
- `Xiao Man` (3x) / `Yu Xiaoman` (2x)
- `Shadow Blade: Night Tiger` (1x) / `Ghostly Shadow Blade – Night Tiger` (1x)

### creature

- `Dasheng` (1474x) / `Da Sheng` (107x)
- `Yuan Dasheng` (1157x) / `Yuan Da Sheng` (18x)  [glossary: `Yuan Dasheng`]
- `Dragon Turtle Fire Spirit` (615x) / `Dragon Tortoise Fire Spirit` (3x)
- `Golden Blood Battle Ape` (252x) / `Golden Blood Battle Ape Dasheng` (131x) / `Golden Blood Battle Ape Da Sheng` (22x) / `Gold-Blooded Battle Ape` (1x)
- `Golden Blood Battle Ape` (252x) / `Golden Blood Battle Ape Dasheng` (131x)
- `Ten Thousand Li Traversing Dragon` (183x) / `Ten Thousand-Li Traversing Dragon` (35x)  [glossary: `Ten Thousand-Li Traversing Dragon`]
- `Ginseng Whiskered Dragon King` (77x) / `Ginseng Beard Dragon King` (20x) / `Ginseng-Whiskered Dragon King` (14x) / `Ginseng Dragon King` (14x) / `Ginseng Whisker Dragon King` (5x) / `Ginseng-Whisker Dragon King` (3x) / `Ginseng-whisker Dragon King` (1x) / `Ginsengbeard Dragon King` (1x) / `Ginseng Whiskerd Dragon King` (1x) / `GinSeng Beard Dragon King` (1x)  [glossary: `Ginseng Beard Dragon King`]
- `Demon Seed` (65x) / `Demonic Seed` (60x)
- `Dice-Bone Demon God` (55x) / `Dice Bone Demon God` (23x)
- `Ma Feitui` (57x) / `Ma Fei Tui` (8x) / `Ma Fei-Tui` (1x)
- `Heavy Armored Blood Ape` (31x) / `Heavy Armored Blood Ape - Dasheng` (19x) / `Heavy Armored Blood Ape Dasheng` (6x)  [glossary: `Heavy Armored Blood Ape - Dasheng`]
- `Flame Crown Divine Fir` (22x) / `Fire Crown Divine Fir` (21x) / `Fire-Crowned Divine Fir` (3x) / `Flame Crown Divine Tree` (1x)
- `Heavy Armored Blood Ape - Dasheng` (19x) / `Heavy Armored Blood Ape Dasheng` (6x) / `Heavy-Armored Blood Ape` (4x) / `Heavy-Armored Blood Ape Dasheng` (3x) / `Heavily-Armored Blood Ape` (2x) / `Heavy-armored Blood Ape` (1x)
- `Mechanical Ape` (23x) / `mechanical wolf ape` (1x)
- `Ox-Headed Ghost Soldier` (9x) / `Ox-headed Ghost Soldier` (7x) / `Bull-headed Ghost Soldier` (3x)
- `Scarlet Flame Demon Beast` (9x) / `Scarlet Flame Beast` (9x)
- `Cangyue Ancient God` (14x) / `Cang Yue Ancient God` (1x)
- `Earth-Melting Ghosts` (4x) / `Earth-Melting Ghost` (2x) / `Earth-Molten Ghost` (1x) / `Earth-Molten Ghosts` (1x) / `Earth Melting Ghost` (1x)
- `Investigative Judge` (6x) / `investigating judge` (2x)
- `Gold-Thread Caged Sparrows` (7x) / `Golden-Thread Caged Sparrow` (1x)
- `Ancient God of the Azure Moon` (5x) / `Ancient God of the Pale Moon` (1x)
- `Snow Bone Rakshasa` (3x) / `Snow-Bone Rakshasas` (3x)
- `Ice-Crystal Ghosts` (3x) / `Icy Crystal Ghosts` (1x) / `Ice Crystal Ghost` (1x)
- `Heavy-Armor Blood Ape - Da Sheng` (1x) / `Heavy Armor Blood Ape - Dasheng` (1x)

### formation

- `Sinking Smoke Pot-Locking Formation` (3x) / `Sunken Smoke Pot-Locking Formation` (1x)
- `Cloud-Attracting Formation` (2x) / `Cloud Attracting Formation` (1x)

### item

- `Naming Fire Furnace` (562x) / `Naming Furnace` (6x)
- `Flowing Cloud` (417x) / `Floating Cloud` (38x)
- `Ten Thousand Li Traversing Dragon` (183x) / `Ten Thousand Li Dragon` (63x) / `Ten Thousand-Li Traversing Dragon` (35x) / `Ten Thousand Mile Soaring Dragon` (9x) / `Ten Thousand Li Wandering Dragon` (5x) / `Ten Thousand Li Flying Dragon` (4x) / `Ten-thousand Li Traversing Dragon` (4x) / `Ten-Thousand-Li Traveling Dragon` (4x) / `Ten-Thousand Li Traversing Dragon` (4x) / `Ten Thousand Miles Traversing Dragon` (3x) / `Ten-Thousand-Mile Soaring Dragon` (3x) / `Ten Thousand Li Traversing dragon` (3x) / `Thousand-Mile Wandering Dragon` (1x) / `Ten Thousand Mile Swimming Dragon` (1x) / `Ten Thousand Li Traveling Dragon` (1x)  [glossary: `Ten Thousand-Li Traversing Dragon`]
- `Buddha Heart Demon Seal` (252x) / `My Buddha Heart Demon Seal` (18x) / `Buddha-Heart Demon Seal` (9x) / `Buddha Heart Devil Seal` (5x) / `Buddha's Heart Demon Seal` (5x) / `My Buddha's Heart-Demon Seal` (3x) / `Buddha Heart Demonic Seal` (2x) / `Buddhist Heart Demon Seal` (1x)  [glossary: `Buddha Heart Demon Seal`]
- `Spirit Concealment Willow` (71x) / `Spirit Concealing Willow` (42x) / `Spirit-Concealing Willow` (1x)
- `Rudie Niang` (113x) / `Rudi Ning` (1x)
- `Embryonic Breath Spirit Boat` (89x) / `Embryonic Breath Spirit Barge` (1x) / `Embryonic-Breath Spirit Boat` (1x)  [glossary: `Embryonic Breath Spirit Boat`]
- `Linglong Mirror Wall` (57x) / `Linlang Mirror Wall` (11x)
- `Fetal Breath Spiritual Boat` (31x) / `Fetal Breath Spirit Boat` (21x) / `Fetal Breathing Spiritual Boat` (6x) / `Fetal Breathing Spirit Boat` (3x)
- `Forest-Piercing Azure Python Chariot` (27x) / `Forest-Piercing Cyan Python Chariot` (15x) / `Forest-Piercing Azure Python Carriage` (10x) / `Forest-Piercing Azure Python Shaft` (1x)
- `Ghost Gate` (50x) / `Ghost Dao Gate` (1x)
- `Forgetful River Seal` (24x) / `Lord of the Forgetful River Seal` (13x) / `Lord of Forgetful River Seal` (11x) / `Lord of Fogetful River Seal` (3x)
- `Heaven-Draping Single Line Hook` (49x) / `Heaven-Dangling Single Line Hook` (1x)
- `Yin-Yang One Qi Kettle` (24x) / `Yinyang One Qi Kettle` (16x) / `YinYang One Qi Kettle` (7x)  [glossary: `Yin-Yang One Qi Kettle`]
- `Five Elements Tower` (23x) / `Five Elements Cannon Tower` (18x) / `Five Elements Earth Tower` (1x)
- `Night Rain Demon Weapon` (38x) / `Night Rain Devil Weapon` (4x)
- `Nine-Orifice Blood Gold` (22x) / `Nine Orifices Blood Gold` (7x) / `Nine-Orificed Blood Gold` (4x) / `Nine-Orificed Blood Gold Fetus` (4x)
- `Wood Fire` (25x) / `Wood-in-Fire` (9x) / `Wood-Fire` (2x)
- `Empty Valley Syllable Azure Mechanism Cylinder` (34x) / `Empty Valley Syllable Cyan Mechanism Cylinder` (1x)
- `Ginseng Dragon Whisker` (23x) / `Ginseng Dragon Whiserks` (2x) / `Ginseng Dragon Wiskers` (1x)
- `Xuanhuang Sword` (22x) / `Xuan Huang Sword` (2x)
- `Five Elements Golden Core Wheel` (23x) / `Five Elements Golden Pill Wheel` (1x)  [glossary: `Five Elements Golden Core Wheel`]
- `Shadow Blade Night Tiger` (18x) / `Phantom Shadow Blade Night Tiger` (1x)  [glossary: `Shadow Blade Night Tiger`]
- `Great Thousand Mechanical Sound Garment` (13x) / `Great Thousand Mechanism Melody Garment` (3x) / `Great Thousand Mechanism Sound Garment` (3x)
- `Five Elements Creation and Destruction Fan` (12x) / `Five Elements Generation and Destruction Fan` (6x)
- `Floating Ice White Jade Hand` (10x) / `Floating Ice Jade Hands` (8x)
- `Pure Yang Ancestor Pill` (14x) / `Chunyang Ancestor Pill` (3x)
- `Ten Thousand Year Fire Essence` (15x) / `Ten Thousand Years Fire Essence` (1x)
- `Snow Maiden Hui` (9x) / `Snow Maiden - Hui` (5x)
- `Netherworld Contemplation Wine` (9x) / `Netherworld Contemplation Brew` (5x)
- `Virtuous Water` (12x) / `Wirtuous Water` (1x)
- `Fire Path Heart Temple` (10x) / `Fire Heart Temple` (2x)
- `Shadow Blade Night Tiger - Yehu` (11x) / `Shadow Blade Night Tiger Yehu` (1x)
- `Heaven-Hanging Single-Thread Hook` (8x) / `Heaven-Hanging Thread Hook` (3x)
- `Mechanical Fire Explosive Monkeys` (6x) / `Mechanical Explosive Monkey` (3x) / `Mechanical Fire Explosive Monkey` (2x)
- `Thousand-Catties Pendant` (6x) / `Thousand-Catty Pendant` (5x)
- `Golden Blood Pill Beads` (6x) / `Golden Blood Pellet Bead` (2x) / `Golden Blood Pellet Beads` (2x)
- `Oil Slick Talisman` (7x) / `Oil-Slick Talisman` (2x) / `Oil Slick Water Talisman` (1x)
- `spiritual box` (6x) / `spirit box` (4x)
- `Jade Steel Heavy Armor` (9x) / `Jade-Steel Heavy Armor` (1x)
- `Nine-Aperture Blood Gold` (5x) / `Nine-Aperture Blood Gold Fetus` (4x)
- `External Peach Fate Core` (8x) / `External Peach Core` (1x)
- `Soul-Shaking Throat Drum` (5x) / `Soul Shaking Rattle Drum` (3x)
- `Xuanyuan Nine-Work Platform` (4x) / `Xuanyuan Nine-Craft Platform` (4x)
- `Sharp Advancement Needle` (6x) / `Sharp Advance Needles` (2x)
- `Thunderstruck Wood Springbirth` (4x) / `Thunderstruck Wood - Spring Thunder` (2x) / `Thunderstruck Wood - Spring Growth` (1x) / `Thunderstruck Wood: Spring's Rebirth` (1x)
- `Ice Light Strong Vein Talisman` (3x) / `Ice Light Strong Meridian Talisman` (2x) / `Ice Light Strong Pulse Talismans` (2x)
- `Profound Ice and Snow Talisman` (5x) / `Profound Ice Pure Snow Talisman` (2x)
- `Thousand-Layered Scale Skin Talisman` (5x) / `Thousand-Layer Scale Skin Talisman` (2x)
- `Netherworld Ghost God Seal` (4x) / `Netherworld Ghost Seal` (1x) / `Underworld Ghost Seal` (1x)
- `Heavenly Ghost Ghost Mask` (4x) / `Heavenly Frost Ghost Mask` (2x)
- `Profound Thought Brew` (4x) / `Profound Thought Dark Brew` (1x)
- `Golden Thread Garments` (3x) / `Golden Threaded Garment` (2x)
- `Vermilion Bird Incense Burner` (3x) / `Vermilion Bird Incense Furnace` (2x)
- `Mountain and River Pages` (3x) / `Mountains and Rivers Pages` (1x) / `Mountain River Page` (1x)
- `Three-Treasure Spirit Earth` (2x) / `Three-Treasure Spiritual Earth` (2x)
- `White Plume Light Dust` (2x) / `White-Plume Light-Dust` (2x)
- `Cloud Sealing Box` (3x) / `Cloud-Sealing Box` (1x)
- `Soul-Stirring Rattle Drum` (2x) / `Soul Stirring Rattle Drum` (1x)
- `Tri-Colored Enamel Armor` (2x) / `Tricolor Enamel Armor` (1x)
- `Five Elements Mechanical Fan` (1x) / `Five Elements Mechanism Fan` (1x)
- `Mist Embroidery Orchid` (1x) / `Mist Embroidered Orchid` (1x)
- `Heavily-Armored Blood Ape Dasheng` (1x) / `Armored Blood Ape - Da Sheng` (1x)
- `Iron Bone Stiffness-Fixing Pill` (1x) / `Iron Bone Stiffness-Setting Pill` (1x)

### other

- `Golden Core` (2706x) / `Gold Core` (9x)  [glossary: `Golden Core`]
- `Three Generals Camp` (238x) / `Three Generals' Camp` (74x) / `Three-Generals Camp` (31x) / `Three General Camp` (29x) / `Third General Camp` (10x) / `Three-General Camp` (1x)  [glossary: `Three Generals Camp`]
- `Rising Cloud Minor Trial` (253x) / `Rising Cloud Trial` (55x) / `Flying Cloud Minor Trial` (27x) / `Rising Clouds Minor Trial` (20x)  [glossary: `Rising Cloud Minor Trial`]
- `Demon Cultivator` (237x) / `Demonic Cultivator` (116x)  [glossary: `Demonic Cultivator`]
- `Qing-Jiao Army` (276x) / `Qingjiao Army` (4x) / `Qing Jiao Army` (1x)  [glossary: `Qing-Jiao Army`]
- `Flying Cloud Assembly` (180x) / `Flying Cloud Grand Assembly` (7x)  [glossary: `Flying Cloud Assembly`]
- `Three Generals Battalion` (128x) / `Three General Battalion` (11x) / `Three Generals' Battalion` (8x) / `Three-Generals Battalion` (4x)
- `Red Flower Battalion` (81x) / `Redflower Battalion` (9x)
- `Hundred Arts of Cultivation` (9x) / `Hundred Crafts of Cultivation` (4x)
- `Mu Grand Marshal's Mansion` (6x) / `Grand Marshal Mu's Mansion` (3x) / `Grand Marshal Mu Shang's mansion` (2x)
- `Thousand Man Soul` (8x) / `Thousand-Soul` (1x)
- `Heaven-Connecting Earth-Linking Two-Phase Formation` (5x) / `Heaven-Connecting Earth-Linking Grand Formation` (4x)
- `Earthen-yellow` (1x) / `Earth-yellow` (1x)

### place

- `Lava Immortal Palace` (1178x) / `Magma Immortal Palace` (16x) / `Molten Lava Immortal Palace` (2x)  [glossary: `Lava Immortal Palace`]
- `Forgetful` (842x) / `Fogetful` (3x)  [glossary: `Forgetful`]
- `White Paper Immortal City` (620x) / `Whitepaper Immortal City` (1x)  [glossary: `White Paper Immortal City`]
- `Fire Persimmon Immortal City` (580x) / `Fiery Persimmon Immortal City` (1x)  [glossary: `Fire Persimmon Immortal City`]
- `Thousand Peaks Forest` (407x) / `Thousand Peak Forest` (39x) / `Ten Thousand Peaks Forest` (27x)  [glossary: `Thousand Peaks Forest`]
- `Southern Bean Kingdom` (277x) / `South Bean Kingdom` (6x)  [glossary: `Southern Bean Kingdom`]
- `Myriad Medicine Sect` (207x) / `Myriad Medicines Sect` (4x)
- `Sun-Supporting Yang-Locking Cloud Ascending Altar` (152x) / `Sun-Supporting Yang-Locking Cloud Ascension Altar` (43x) / `Sun-Supporting Yang-Locking Cloud-Ascending Altar` (4x)  [glossary: `Sun-Supporting Yang-Locking Cloud Ascending Altar`]
- `Two Note Kingdom` (171x) / `Two Notes Kingdom` (16x) / `Two Note Kingdoms` (3x)  [glossary: `Two Note Kingdom`]
- `Two Note Nation` (161x) / `Two-Note Nation` (11x) / `Two Noted Nation` (3x)
- `Forest Immortal City` (63x) / `Green Forest Immortal City` (60x)
- `Two Note Country` (79x) / `Two Notes Country` (19x) / `Two-Note Country` (12x)
- `Artifact Refining Hall` (87x) / `Artifact Refinement Hall` (8x)
- `Huazhang Kingdom` (59x) / `Hua Zhang Kingdom` (7x)
- `Thousand Medicines Sect` (40x) / `Ten Thousand Medicines Sect` (25x)
- `Little Contention Peak` (62x) / `Little Contention Peak Peak` (3x)
- `Ghostly Black Marshlands` (55x) / `Ghostly Black Marsh` (4x) / `Ghostly Black Marshland` (1x)  [glossary: `Ghostly Black Marshlands`]
- `Secret Pavilion of Opportunities` (59x) / `Secret Pavilion of Opportunity` (1x)
- `Myriad Beasts Peak` (39x) / `Myriad Beast Peak` (20x)
- `Ten Li Burning Forest` (49x) / `Ten-Li Burning Forest` (3x) / `Ten-li Burning Forest` (1x)
- `Sun-Supporting Yang-Locking Cloud Ascension` (43x) / `Sun-Supporting Yang-Locking Cloud-Ascending` (4x)
- `Heavenly Treasure Pavilion` (39x) / `Heaven's Treasure Pavilion` (4x)
- `Five Elements Tower` (23x) / `Five Elements Cannon Tower` (18x) / `Five Elements Cannon Watchtower` (2x)
- `Bluestone Cave Dwelling` (27x) / `Blue Stone Cave Dwelling` (11x)
- `Dragon King Giant Wood Mountain` (21x) / `Dragon King Mountain` (8x) / `Dragon King's Giant Wooden Mountain` (3x) / `Dragon King Giant Wooden Mountain` (2x) / `Dragon King's Giant Pillar Mountain` (2x) / `Dragon King Pillar Mountain` (1x) / `Dragon King Wooden Mountain` (1x)
- `Southern Bean Country` (25x) / `South Bean Country` (8x)
- `Demonic Gate` (24x) / `Demon Gate` (7x)
- `Wooden Wheel Town` (27x) / `Wood Wheel Town` (1x) / `Woodwheel Town` (1x)
- `Ten Thousand Demons Cave` (23x) / `Ten Thousand Demon Cave` (5x)
- `Ten Thousand Medicines Valley` (24x) / `Ten Thousand Medicine Valley` (3x)
- `Origin Mountain` (12x) / `Original Mountain` (9x)
- `Mist Concealment Mountain` (19x) / `Mist-Concealing Mountain` (1x)
- `Southern Bean Immortal` (8x) / `Southern Bean Immortal Kingdom` (5x) / `Southern Bean Royal Court` (2x) / `Southern Bean Immortal Dynasty` (2x) / `Southern Bean Immortal Court` (1x)
- `Myriad Medicine Valley` (16x) / `Myriad Medicines Valley` (2x)
- `Great Contention Peak` (14x) / `Great Contest Peak` (3x)
- `Bikun Mountain` (11x) / `Bikong Mountain` (4x) / `Bi Kong Mountain` (2x)
- `Blue Stone Cave Abode` (11x) / `Azure Stone Cave Abode` (5x)
- `Gourd Fire Furnace Forest` (13x) / `Gourd Furnace Forest` (3x)
- `Ten Thousand Beasts Cave` (11x) / `Ten Thousand Beast Cave` (2x)
- `Yugang Mountain` (9x) / `Yujian Mountain` (3x)
- `Blackwater Mountain` (7x) / `Black Water Mountain` (5x)
- `Azure Stone Cave Mansion` (10x) / `Green Stone Cave Mansion` (1x)
- `Weakwater` (8x) / `Weak Water` (3x)
- `Misty Hidden Mountain` (8x) / `Mist-Hidden Mountain` (2x)
- `Thousand Vine Talisman Heavenly Corridor` (5x) / `Thousand Vine Talisman Corridor` (3x) / `Thousand Vines Talisman Heavenly Corridor` (1x)
- `North Wind Nation` (4x) / `Northern Wind Nation` (2x)
- `Sword's Cry Peak` (3x) / `Sword Cry Peak` (3x)
- `Wan Yao Cave` (3x) / `Wanyao Cave` (2x)
- `Yuanlai Mountain` (2x) / `Yuanshan Mountain` (2x) / `Yuan Mountain` (1x)
- `Myriad Demon Cave` (2x) / `Myriad Demons Cave` (2x)
- `Dazheng Peak` (2x) / `Da Zheng Peak` (1x)
- `Heaven-Pillar Giant-Tree Mountain` (1x) / `Heaven-Pillar Giant Wood Mountain` (1x) / `Heavenly Pillar Giantwood Mountain` (1x)
- `Dragon Shadow Nine Pillar Parade Platform` (1x) / `Dragon Shadow Nine-Pillar Parade Platform` (1x)
- `Moon Hook Mountain` (1x) / `Moonhook Mountain` (1x)

### sect

- `Myriad Manifestations Sect` (1099x) / `Myriad Manifestation Sect` (1x)  [glossary: `Myriad Manifestations Sect`]
- `Demon Subjugation Hall` (390x) / `Demon-Subjugation Hall` (3x)  [glossary: `Demon Subjugation Hall`]
- `Death-Facing Sect` (209x) / `Death Facing Sect` (5x)
- `Soul Devouring Sect` (170x) / `Soul-Devouring Sect` (2x)  [glossary: `Soul Devouring Sect`]
- `Six Caves Sect` (65x) / `Six Cave Sect` (28x) / `Six Caverns Sect` (7x) / `Six Cavern Sect` (1x)
- `Barbarian Demon Camp` (80x) / `Barbarian-Demon Camp` (8x) / `Barbaric Demon Camp` (2x)
- `Demon Heart Cave` (69x) / `Demonic Heart Cave` (5x)
- `Thunder Cloud Society` (20x) / `Thundercloud Society` (8x)
- `Thousand Peaks Forest Alliance` (17x) / `Thousand Peak Forest Alliance` (2x) / `Ten Thousand Peaks Forest Alliance` (2x)
- `Grand Marshal Mu` (12x) / `Mu Grand Marshal` (8x)
- `Zhu Family` (16x) / `Zhuo family` (3x)
- `Hundred Poison Tribe` (11x) / `Hundred Poisons Tribe` (5x)
- `Barbarian Demon Battalion` (6x) / `Barbarian Demon Batallion` (5x) / `Barbarian-Demon Battalion` (4x)
- `Water-Severing Blade Pavilion` (11x) / `Water-Severing Saber Pavilion` (2x)
- `Stone Alliance` (6x) / `Goldstone Alliance` (3x) / `Gold and Stone Alliance` (2x)
- `Bloodslaughter Imperial Dynasty` (2x) / `Blood Slaughter Imperial Dynasty` (2x)

### technique

- `Life Hanging by a Thread` (363x) / `Life-Hanging Thread` (30x) / `Life Hanging by a Threads` (11x) / `Life-Hanging-by-a-Thread` (4x) / `Life-Hanging-By-A-Thread` (4x) / `Life Thread Hanging by a Thread` (4x) / `Life Hanging Thread` (3x) / `Life Haning by a Thread` (2x) / `Live Hanging by a Thread` (1x)  [glossary: `Life Hanging by a Thread`]
- `Demonic Dao Scripture` (100x) / `Demonic True Scripture` (3x) / `Demonic Scripture` (3x)
- `Five Element Techniques` (41x) / `Five Elements Techniques` (39x) / `Fire Element Techniques` (21x)
- `Nine Palaces Formation` (52x) / `Nine Palace Formation` (17x)
- `Mirror Platform Spirit Communication Technique` (33x) / `Mirror Platform Spirit Communication Manual` (19x) / `Mirror Platform Spirit Communication Incantation` (15x)  [glossary: `Mirror Platform Spirit Communication Manual`]
- `Ice Jade Hand` (47x) / `Ice-Jade Hand` (1x)
- `Sage's Great Thief Scripture` (35x) / `Sage's Great Theft Scripture` (10x) / `Sage Great Thief Scripture` (1x)
- `Red Flower Dharma Aspect` (29x) / `Red Flower Dharmic Aspect` (13x)
- `Life Thread` (33x) / `Life-Threading` (3x)
- `Golden Liquid Reverting` (10x) / `Golden Liquid Returning` (9x) / `Golden Liquid Returned` (8x) / `Golden Liquid Reverted` (5x) / `Golden Liquid Returned Pill` (4x)
- `Reverse Five Elements Demonic Art` (28x) / `Inverted Five Elements Demonic Art` (7x)
- `Iron Flow Levels the Plains` (18x) / `Iron Flow Leveling the Plains` (8x)
- `Stone Forging Earth Treasure` (17x) / `Stone Forged Earth Treasure` (9x)
- `Demonic Pollution Blood Sinew Technique` (23x) / `Demonic Pollution Blood Muscle Technique` (2x)
- `Myriad Methods Demonic Descent Art` (14x) / `Myriad Methods Demonic Degeneration Art` (8x)
- `Sage Great Thief Sutra` (10x) / `Sage's Great Thief Sutra` (7x) / `Saint's Great Thief Sutra` (4x)
- `Mirror Platform Spirit Communication Incantation` (15x) / `Mirror Platform Spirit Communication Art` (2x)
- `Nine Twists Corridor Formation` (14x) / `Nine Twist Corridor Formation` (2x)
- `Five Viscera Temple Spirit Art` (9x) / `Five Viscera Spirit God Art` (5x) / `Five Viscera Spirit Arts` (1x)  [glossary: `Five Viscera Temple Spirit Art`]
- `Three Sect Superior Techniques` (12x) / `Three Sects Techniques` (3x)
- `Void Traversing Technique` (10x) / `Void Traversal Technique` (3x)
- `Iron Skin Flesh Armor Technique` (8x) / `Iron Skin and Flesh Armor Technique` (4x)
- `Heaven and Earth Combined Attack` (7x) / `Heaven-Earth Combined Strike` (4x) / `Heaven and Earth Combined Strike` (1x)
- `Primordial Sound Reed Book` (8x) / `Primordial Reed Book` (3x)
- `Nine Turns Soul Devouring Incantation` (9x) / `Nine-Turns Soul Devouring Incantation` (1x)
- `Mirror Platform Spiritual Communication Technique` (5x) / `Mirror Platform Spirit Connection Technique` (3x) / `Mirror Platform Communication Technique` (1x)
- `Five Elements Creation and Destruction Art` (7x) / `Five Elements Creation-Destruction Art` (2x)
- `Fire Cremation Prajna Spirit-Resolving Sutra` (6x) / `Cremation Prajna Spirit Liberation Sutra` (1x) / `Cremation Prajna Spirit-Relieving Sutra` (1x)
- `Phenomenal Seed Talisman` (6x) / `Phenomenon Seed Talisman` (1x)
- `Flame Crown Dao Field` (6x) / `Fire Crown Dao Field` (1x)
- `Iron Torrent Flattening the Plains` (5x) / `Iron Torrent Flattens the Plains` (1x)
- `Five Organs Temple Spirit Technique` (5x) / `Five Victory Temple Spirit Technique` (1x)
- `Earth-Walking Technique` (5x) / `Earth Walking Technique` (1x)
- `Great art of Heaven and Earth Embryonic Breathing` (4x) / `Great Arts of Heaven and Earth Embryonic Breathing` (1x)
- `Mirror Platform Spirit-Linking Art` (3x) / `Mirror Platform Spirit-Communing Art` (1x)
- `Drunken Moon Seeking Immortals` (3x) / `Drunken Moon Chasing Immortal` (1x)
- `Night-Stalking Thornback Diagram` (3x) / `Nightwalking Thornback Diagram` (1x)
- `Iron Flow Flatland Military Strategy` (2x) / `Iron-Flow Flatland Military Strategy` (1x)
- `Return of the Warrior` (2x) / `Return of the Brave Warriors` (1x)
- `Myriad Wood Springthunder Guidance` (2x) / `Myriad Wood Spring Thunder Guidance` (1x)
- `Thousand Vines Drinking Clouds Formation` (1x) / `Thousand Vines Drinking Cloud Formation` (1x)
- `Soul-Dissolving Dark Technique` (1x) / `Soul-Dissolving Technique` (1x)
- `Black Waves Overwhelming` (1x) / `Black Wave Overwhelming` (1x)
- `Purple-beard Astonishing Hong` (1x) / `Purple-bearded Astonishing Phoenix` (1x)

### title

- `family patriarch` (89x) / `Ning family patriarch` (83x) / `Ning Family Patriarch` (36x)
- `Rust Disaster Craftsman` (52x) / `Rust Disaster Artisan` (47x)
- `Military Advisor` (75x) / `Military Adviser` (5x)
- `Qing Wu Langjun` (11x) / `Qingwu Langjun` (10x)
- `Nascent Soul Demon Cultivator` (11x) / `Nascent Soul Demonic Cultivator` (5x)
- `Mysteries of Immortal Puppet Master` (7x) / `Mysteries of the Immortal Puppet Master` (6x)

## 3. Wording variants (possibly the same entity)

Different words for what workers judged to be the same thing. Entries were grouped from worker notes, so some groups mix distinct entities (for example a person plus an unrelated nickname); treat each as a lead to confirm, not a verdict.


### character

- Divine Investigator (title; Zhu holds it): `Zhu Xuanji` (2527x, ch 55-955) / `Lord Zhu` (150x, ch 119-662) / `Divine Constable Zhu` (19x, ch 213-708) / `Divine Investigator` (13x, ch 55-398)
- Ning Xiaoren (Ning junior patriarch, Ning Zhuo's uncle): `Ning Xiaohui` (685x, ch 15-799) / `Ning Xiaoren` (491x, ch 1-333)
- Qing Chi, Ghost Clan girl: `Qing Chi` (1059x, ch 599-1027) / `Qing'er` (13x, ch 786-851)  [glossary: `Qing Chi`]
- Zhu Fenxiang, female Zhu Clan cultivator (Myriad Manifestations): `Fenxiang` (500x, ch 745-1028) / `Zhu Fenxiang` (463x, ch 745-1028)  [glossary: `Zhu Fenxiang`]
- Meng Yaoyin, Ning Zhuo's mother (mechanical construct): `Meng Yaoyin` (488x, ch 92-1013) / `Buddhist Doctor - Meng Yaoyin` (111x, ch 328-913) / `Buddhist Physician Meng Yaoyin` (14x, ch 419-694) / `Buddhist Healer Meng Yaoyin` (7x, ch 330-545)  [glossary: `Meng Yaoyin`]
- Forgetful River Prefecture Lord, main antagonist: `Forgetful River Prefecture Lord` (457x, ch 597-1014) / `Lord of the Forgetful River` (34x, ch 593-850) / `Lord Wangchuan` (14x, ch 650-666) / `Lord of the Wangchuan Prefecture` (4x, ch 665-665)  [glossary: `Forgetful River Prefecture Lord`]
- Cheng Bai, Blind Judge, Soul Devouring Sect true disciple: `Cheng Bai` (384x, ch 126-268) / `Qi Bai` (95x, ch 125-695)
- Old Master Long / Lord Long, dragon king's temple officiant (possibly : `Lord Long` (318x, ch 437-569) / `Elder Long` (132x, ch 554-572) / `Old Master Long` (14x, ch 435-435) / `Long Ye` (14x, ch 521-560)
- Yang Chanyu (Void Sect Golden Core true disciple): `Yang Chanyu` (391x, ch 150-512) / `Fairy Chanyu` (52x, ch 200-254)
- Linghu Jiu, Myriad Medicine Sect senior disciple, wine lover: `Linghu Jiu` (426x, ch 350-929) / `Ling Hu` (11x, ch 388-408)
- Tian Shuang - Heavenly Ghost, Buddhist-converted ghost cultivator: `Tian Shuang` (290x, ch 512-726) / `Heavenly Ghost` (109x, ch 535-723)
- Han Ming, Soul Devouring Sect disciple, corpse-cultivator woman: `Han Ming` (357x, ch 34-925) / `Han Wu` (3x, ch 125-132)
- Du Tiechuan, Soul Formation Two Note commander: `Du Tiechuan` (296x, ch 430-578) / `Commander Du` (28x, ch 490-566) / `Marshal Du` (26x, ch 494-530)
- Jiao Ma (possible nickname Little Ma): `Jiao Ma` (241x, ch 572-669) / `Little Ma` (85x, ch 599-664)  [glossary: `Jiao Ma`]
- Meng Yaoyin, mechanical Buddhist Doctor puppet: `Buddhist Doctor` (167x, ch 328-913) / `Buddha Doctor` (53x, ch 324-632) / `Buddhist Physician` (18x, ch 419-694) / `Buddhist Healer` (13x, ch 330-582) / `Buddha Healer` (11x, ch 135-333)
- Shuang Ling (Princess of Mechanisms, Nascent Soul): `Shuang Ling` (188x, ch 489-565) / `Mechanism Princess` (7x, ch 549-549) / `Princess of Mechanisms` (5x, ch 490-496) / `Ingenious Princess` (4x, ch 522-532) / `Machinery Princess` (3x, ch 489-547)
- Sorrowful Melody Ghost Seer (Sang Le Youling), White Paper City divina: `Sorrowful Melody Ghost Seer` (128x, ch 567-695) / `Sang Le Youling` (57x, ch 582-588) / `Lady of Sorrowful Bones` (23x, ch 627-652) / `Sorrowful Ghost Melody Seer` (3x, ch 597-600)  [glossary: `Sorrowful Melody Ghost Seer`]
- Meng Yehu, deceased Golden Core beast cultivator with planned mechanis: `Meng Yehu` (175x, ch 349-1014) / `Nightblade Shadow` (14x, ch 555-580)  [glossary: `Meng Yehu`]
- Zheng family Golden Core cultivator with mechanical scythe: `Zheng Danlian` (189x, ch 143-328) / `Zheng Dan` (4x, ch 242-318)
- Chi Han / Chi Dun, City Lord's Mansion official under Meng Kui: `Chi Dun` (154x, ch 16-331) / `Chi Han` (33x, ch 120-244) / `Tui Han` (5x, ch 196-224)
- Twin Ghosts of Heaven and Earth (Soul Devouring Sect): `Twin Ghosts of Heaven and Earth` (99x, ch 512-599) / `Heaven and Earth Twin Ghosts` (32x, ch 526-723)
- Di Hui, black-clad Twin Ghost: `Di Hui` (83x, ch 512-722) / `Earth Ghost` (35x, ch 537-567) / `Di Gui` (18x, ch 540-696)
- Five Elements Divine Lord, ancient figure, Ning Zhuo's teacher-by-tran: `Five Elements Divine Lord` (100x, ch 386-1015) / `Five Elements Divine Master` (6x, ch 402-529)
- Demon Heart Cave Master (cavern lord): `Demon Heart Cave Master` (61x, ch 417-691) / `Demon Heart Cavern Lord` (14x, ch 416-416) / `Lord Demonheart` (3x, ch 564-567)
- Xiao Ju, Lin Shanshan's maid: `Xiao Ju` (89x, ch 375-390) / `Little Ju` (7x, ch 396-396)
- Zheng Shoumo, old Confucian Ink Pool guardian, revealed as traitor: `Zheng Shoumo` (87x, ch 598-627) / `Mo Chi` (3x, ch 598-598)
- Old Sword - Sword spirit advising Gao Cuo: `Old Sword` (29x, ch 528-551) / `Sword Elder` (29x, ch 497-562) / `Sword Old` (5x, ch 533-533)
- Blood Shadow Cave Master (cavern lord): `Blood Shadow Cave Master` (46x, ch 417-566) / `Blood Shadow Cavern Lord` (10x, ch 416-416) / `Lord of the Blood Shadow Cave` (3x, ch 554-554)
- Zhang Xiaodan / Zhang Dadan (ally, puppet user): `Zhang Dadan` (51x, ch 738-1024) / `Zhang Xiaodan` (11x, ch 710-737)
- Chui Xu Ke, Ning Zhuo's disguise alias (crippled old cultivator): `Chui Xu Ke` (36x, ch 132-267) / `Chui Tiao Ke` (18x, ch 285-311)
- Li Jiuqu - Gu Cultivator, wanted criminal: `Li Jiǔqu` (23x, ch 548-548) / `Li Jiuchu` (10x, ch 560-560)
- Master Shengxu - Soul Formation-level healer, Life Sea deal: `Master Shengxu` (26x, ch 513-564) / `Young Master Sheng Xu` (21x, ch 423-566)
- Fairy Consort Jingyue, Linglong Mirror Wall spirit: `Jade Immortal Princess` (10x, ch 398-405) / `Fairy Consort` (9x, ch 403-403) / `Fairy Queen` (9x, ch 404-404) / `Jingyu` (8x, ch 404-406)
- Mo Yuan, Cave Master: `Cave Master Mo Yuan` (23x, ch 430-455) / `Mo Yuan Cave Master` (18x, ch 430-454)
- Wutu Prison-Suppressing True Lord: `Wutu Prison-Suppressing True Lord` (21x, ch 775-997) / `True Lord Wutu` (12x, ch 989-1003) / `True Lord Wutu of Prison Suppression` (8x, ch 1003-1003)
- Three Schools Supreme Sage (founder of palace and bell): `Three Schools Supreme Sage` (33x, ch 1-331) / `Three Lords of the Sects` (3x, ch 119-119)
- Red Sleeve Fairy, giant mountain-mover: `Red Sleeve Fairy` (22x, ch 515-564) / `Red Sleeve Immortal` (13x, ch 527-534)
- Ding Pi - Spiritual chef, Jia Wan's master: `Ding Pi` (26x, ch 502-565) / `Ding Bi` (3x, ch 552-560)
- Flowing Flame Immortal (Yan Liu), array controller: `Flowing Flame Fairy` (13x, ch 529-532) / `Immortal Liu Yan` (6x, ch 528-528) / `Yan Liu Fairy` (5x, ch 526-526)
- Feng Feidao (City Lord's Mansion reformation leader): `Feng Dao` (17x, ch 208-316) / `Feng Feidao` (7x, ch 148-208)
- Chui Can Ke, rogue black-market mechanist (Chui Rong Ke): `Chui Rong Ke` (11x, ch 120-124) / `Chui Can Ke` (10x, ch 120-126)
- Lone Fang - Pale Moon barbarian general, Cangyue tribe: `Lone Fang` (19x, ch 437-568) / `Lone Wolf` (3x, ch 554-554)
- Director of Vigorous Yang Manor, advised Li Xiangshang: `Director Zheng` (13x, ch 605-607) / `Director Zhao` (5x, ch 605-605)
- Poison Annihilation (Lone Cultivator / Wanderer): `Lone Cultivator Poison Annihilation` (9x, ch 922-925) / `Poison Annihilation Wanderer` (8x, ch 926-963)
- Young Master Sheng Xu, assassin Nascent Soul: `Young Master Shengxu` (10x, ch 513-564) / `Sheng Xu Gongzi` (5x, ch 521-521)
- Jin Tunhe - Three-legged golden toad demon, coin talismans: `Jin Tunhe` (11x, ch 547-566) / `Golden River Swallower` (3x, ch 560-560)
- Cangteng King / Cang Tengwang, Golden Core husband of Bi Tengyi: `Cang Tengwang` (7x, ch 436-449) / `Cangteng King` (4x, ch 435-437)

### creature

- Yuan Dasheng, the Molten Flame Demonic Ape (former name Da Sheng): `Dasheng` (1474x, ch 53-1014) / `Yuan Dasheng` (1157x, ch 53-1014) / `Golden Blood Battle Ape` (252x, ch 82-354) / `Tree Martial Ape` (60x, ch 121-199) / `Heavy Armored Blood Ape - Dasheng` (19x, ch 328-1013) / `Tree Martial Battle Ape` (10x, ch 118-118)  [glossary: `Yuan Dasheng`]
- Old Stone Monster (earth creature in stone): `Old Stone Monster` (186x, ch 419-693) / `Old Monster` (109x, ch 426-909) / `Old Monster in the Stone` (78x, ch 426-527) / `Stone Elder` (9x, ch 417-564) / `Stone-Old Demon` (6x, ch 416-416) / `Stone-Cloistered Old Monster` (6x, ch 480-480)
- Ginseng Beard/Whisker Dragon King, Soul Formation dragon: `Ginseng Whiskered Dragon King` (77x, ch 518-568) / `Dragon King Ginseng` (6x, ch 562-562)  [glossary: `Ginseng Beard Dragon King`]
- Dice-Bone Demon God (later bracelet servant): `Dice-Bone Demon God` (55x, ch 493-504) / `Bone-Dice demonic god` (21x, ch 494-494) / `Old Dice` (6x, ch 498-532)
- Nirvana Buddha phantom of Soundless Ghost Monk: `Nirvana Buddha Phantom` (62x, ch 657-667) / `Nirvana Buddha Shadow` (5x, ch 658-660)
- Nascent Soul-level fire snake attacking the Palace: `fire snake` (53x, ch 11-327) / `flame snake` (11x, ch 276-280)
- Fire Crown Divine Cedar, Burning Forest deity: `Flame Crown Divine Fir` (22x, ch 531-531) / `Fire Crown Divine Cedar` (14x, ch 527-648) / `Fire Crown Divine Deity` (3x, ch 530-530)
- Grandma Xi, Nascent Soul Fire Fusion Magic Ape held by Ning Jiufan: `Elder Ape` (21x, ch 408-540) / `Grandma Xi` (14x, ch 372-391) / `Aunt Xi` (7x, ch 384-385)
- Palace beast attacking Lava Immortal Palace: `Fire Fusion Demon Ape` (38x, ch 142-334) / `Fire Melting Demon Ape` (6x, ch 135-197)
- Ten-Thousand-Year Fire Essence (fire creature in Fire Persimmon Mounta: `Ten-Thousand-Year Fire Essence` (30x, ch 432-487) / `Ten-Thousand-Year Fire Spirit` (12x, ch 486-486)
- Cangyue Ancient God, moon-domain deity: `Cangyue Ancient God` (14x, ch 503-565) / `Ancient God of the Azure Moon` (5x, ch 501-552)
- Joint-Hugging/Clasping Pheasant: `Joint-Clasping Pheasants` (6x, ch 934-951) / `Joint-Hugging Pheasant` (5x, ch 911-948)

### item

- Mechanical dragon vessel (Ten Thousand Li Traversing Dragon): `Ten Thousand Li Traversing Dragon` (183x, ch 299-724) / `Ten Thousand Miles` (16x, ch 342-824) / `Myriad Li Wandering Dragon` (8x, ch 344-345) / `Myriad-Mile Dragon` (3x, ch 351-351)  [glossary: `Ten Thousand-Li Traversing Dragon`]
- Snow-Colored Maiden Hui: `Snow-Colored Maiden Hui` (208x, ch 695-1014) / `Snow-Colored Lady Hui` (14x, ch 694-699) / `Snow Maiden Hui` (9x, ch 698-700) / `Snow-Colored Maiden - Wisdom` (9x, ch 700-760)  [glossary: `Snow-Colored Maiden Hui`]
- Profound armor (armor type, possibly same item): `Profound Armament Armor` (166x, ch 747-946) / `Profound Weapon Armor` (44x, ch 766-955) / `Profound Soldier Armor` (18x, ch 773-981)
- Fetal Breath Spirit Boat, heirloom boat Ning wants to acquire: `Embryonic Breath Spirit Boat` (89x, ch 405-867) / `Fetal Breath Spiritual Boat` (31x, ch 432-499)  [glossary: `Embryonic Breath Spirit Boat`]
- ring housing Zheng Jian soul spirituality: `Mechanism Ring` (59x, ch 514-1021) / `mechanical ring` (26x, ch 278-620) / `mechanical finger ring` (7x, ch 520-589)  [glossary: `Mechanism Ring`]
- Spirit Concealment Willow, Golden Core-level spirit plant Ning Zhuo te: `Spirit Concealment Willow` (71x, ch 345-567) / `Lingyin Willow` (8x, ch 365-366)
- Black scythe-serpent demonic weapon (Zheng family): `Night Rain Demon Weapon` (38x, ch 192-402) / `Great Serpent Scythe` (27x, ch 325-878) / `Mechanical Black Serpent` (8x, ch 233-233) / `Great Snake Scythe` (3x, ch 333-514) / `Great Snake Dart` (3x, ch 339-339)
- Pure Yang Patriarch Pill: `Pure Yang Patriarch Pill` (59x, ch 982-1022) / `Pure Yang Ancestor Pill` (14x, ch 988-1021)
- Blood Ember Fire Seed: `Blood Ember` (40x, ch 947-1003) / `Blood Ember Fire Seed` (31x, ch 947-1003)
- Military Seed, Qing Chi army core artifact: `Military Seed` (60x, ch 613-808) / `Military Heart` (6x, ch 613-647)
- Nether Dragon Scissors, National Artifact: `Nether Dragon Scissors` (57x, ch 636-866) / `Nether Dragon Silhouette` (9x, ch 654-656)
- Ning Zhuo's mechanical dragon vehicle: `Mechanical Dragon` (53x, ch 360-729) / `Mechanical Wandering Dragon` (9x, ch 409-568) / `Mechanized Dragon` (3x, ch 442-505)  [glossary: `Mechanical Dragon`]
- Ginseng Whisker (battlefield dragon whisker): `Ginseng Whisker` (39x, ch 435-561) / `Ginseng Dragon Whisker` (23x, ch 519-519)
- Black Snake Spear (Zhang Hei's spear): `Serpent Spear` (24x, ch 447-559) / `Black Snake Spear` (20x, ch 421-556) / `Black Serpent Spear` (20x, ch 447-559)
- Clan Destiny chain (mechanism item): `Clan Destiny Pivot Chain` (50x, ch 741-908) / `Clan Destiny Mechanism Chain` (11x, ch 742-764)
- Dao-Bearing Jade Page / Inheritance Jade Page (inheritance item): `Dao-Bearing Jade Page` (59x, ch 801-1026) / `Inheritance Jade Page` (3x, ch 806-825)
- Heaven-Draping Single Line Hook (magic treasure): `Heaven-Draping Single Line Hook` (49x, ch 967-1023) / `Heaven-Hanging Single-Thread Hook` (8x, ch 977-983)
- Mechanical Fire Explosive Monkey: `Mechanical Fire Monkey` (12x, ch 157-694) / `Explosive Monkeys` (9x, ch 166-214) / `Mechanical Fire Explosive Monkeys` (6x, ch 166-214) / `Fire Blast Monkeys` (6x, ch 176-176)
- Intent Comprehension Brush: `Intent Comprehension Brush` (29x, ch 705-711) / `Intentional Brush` (13x, ch 703-734) / `Ideographic Brush` (9x, ch 704-704)
- Wood Fire (Samadhi fire seed): `Wood Fire` (25x, ch 526-957) / `Fire Within Wood` (14x, ch 546-880)
- Meditative Brew family, Linghu Jiu's wine (called Netherworld Contempl: `Meditative Brew` (23x, ch 386-398) / `Netherworld Contemplation Wine` (9x, ch 393-395) / `Profound Thought Brew` (4x, ch 387-407)
- Golden Swallow Trident, treasure the male consorts compete for: `Golden Swallow Trident` (42x, ch 584-725) / `Golden Swallow Fork` (4x, ch 600-605)
- Nine-Orifice Blood Gold Fetus (item): `Nine-Orifice Blood Gold` (22x, ch 933-938) / `Nine-Aperture Blood Gold` (5x, ch 939-943)
- Han Armor (Ning Zhuo's mechanical battle armor): `Black Iron Han Armor` (26x, ch 658-930) / `Azure Iron Han Armor` (16x, ch 514-693)  [glossary: `Black Iron Han Armor`]
- Bamboo puppets (Zhang Dadan's puppets): `Bamboo Puppet` (33x, ch 709-1000) / `Little Bamboo Puppet` (4x, ch 716-716)
- Azure Python carriage/chariot (mechanism vehicle): `Azure Python Chariot` (27x, ch 742-954) / `Azure Python Carriage` (10x, ch 740-951)
- Ice Snow Weather Sphere (mechanical ice sphere): `Ice Snow Weather Sphere` (19x, ch 183-355) / `Ice Crystal Snow` (11x, ch 239-705)
- Fire Persimmon sect-side Millennium Fire Essence (Ten Thousand Year Fi: `Ten Thousand Year Fire Essence` (15x, ch 372-526) / `Millennium Fire Essence` (7x, ch 409-409) / `Eternal Fire Spirit` (6x, ch 512-512)
- Ning Zhuo's mechanical armor: `Blue Iron Armor` (16x, ch 123-136) / `Blue Azure Iron Armor` (10x, ch 137-640)
- Thousand-Catty Pendant (item): `Thousand-Catties Pendant` (6x, ch 937-937) / `Thousand-Jin Drop` (6x, ch 933-938) / `Thousand Catty Drop` (4x, ch 936-936) / `Thousand Catty Fall` (3x, ch 935-935)
- Herd/Flock-Startling Whistle (item): `Flock-Startling Whistle` (18x, ch 933-948) / `Herd-Startling Whistle` (6x, ch 934-934)
- Meng Kui's peach-fate projectile treasure: `Peach Fate Core` (9x, ch 135-216) / `External Peach Fate Core` (8x, ch 140-216) / `Peach Core of External Fate` (4x, ch 136-136)
- Guan Hong's Blood Dragon weapon: `Blood Dragon Blade` (16x, ch 440-556) / `Blood Dragon Saber` (7x, ch 421-501)
- Lifebound Buddha Wheel: `Lifebound Buddha Wheel` (17x, ch 630-667) / `Buddhist Wheel` (6x, ch 630-660)
- Under-tongue concealment bud (cloud disguise item): `Cloud Concealment Bud` (13x, ch 198-338) / `Hidden Cloud Bud` (3x, ch 234-234)
- Golden Blood Core/Pellet/Pill Bead: `Golden Blood Pill Beads` (6x, ch 943-946) / `Golden Blood Core Beads` (4x, ch 951-952)
- Ning family protective talisman with oily shield: `Oil Slick Talisman` (7x, ch 276-364) / `Oily Glide Talisman` (4x, ch 359-359)
- Formation Gap Shuttle: `Formation Gap Shuttle` (10x, ch 682-683) / `Treasure Shuttle` (3x, ch 682-682)
- Array Dao Magical Treasure: `Array Dao Magical Treasure` (12x, ch 682-691) / `Formation Dao Treasure` (3x, ch 681-681)
- Clear Heart Evil-Reflecting/Illuminating Mirror: `Clear Heart Evil-Illuminating Mirror` (8x, ch 994-1019) / `Clear Heart Evil-Reflecting Mirror` (6x, ch 992-993)
- Rare herb sold by Cloud Merchants (disguise orchid): `Mist Rust Orchid` (6x, ch 351-360) / `Misty Elegant Orchid` (3x, ch 375-387)
- Five-paper set paper (Starry Sky / Stellar Tracks): `Starry Sky Stationery` (10x, ch 802-802) / `Stellar Tracks Paper` (3x, ch 803-803)
- Black Iron Han Armor Golden Swallow form/model: `Golden Swallow Model` (10x, ch 902-910) / `Golden Swallow Form` (3x, ch 901-901)
- Ten Thousand Year Water Crystal / Essence, Nascent Soul resource: `Ten Thousand Year Water Crystal` (8x, ch 404-405) / `Ten Thousand Year Water Essence` (4x, ch 407-407)
- Ice Heart Jade vessel for Ice Jade Wine: `Ice Heart Jade Pot` (7x, ch 140-333) / `Ice Heart Jade Flask` (4x, ch 169-329)
- Divided-Spirit mirror (split divine sense mirror): `Divided-Spirit Mirror` (6x, ch 488-488) / `Splitting Mind Mirror` (3x, ch 483-483)
- Red copper material for Golden Core mechanical ape: `Scarlet Sun Copper` (4x, ch 189-554) / `Red Sun Copper` (3x, ch 190-193)
- Ghost-Beating Lantern - Tian Shuang's ice-prison lantern: `Ghost-Beating Lantern` (4x, ch 536-536) / `Ghost-Striking Lantern` (4x, ch 541-541)

### other

- Three Generals Camp (military camp): `Three Generals Camp` (238x, ch 421-695) / `Three Generals Battalion` (128x, ch 422-565)  [glossary: `Three Generals Camp`]
- Cultivation realm, qi refining stage: `Qi Refining` (450x, ch 3-997) / `Qi Refinement` (24x, ch 101-752)
- Red Flower military camp: `Red Flower Camp` (241x, ch 418-808) / `Red Flower Battalion` (81x, ch 422-591)  [glossary: `Red Flower Camp`]
- Qing-Jiao Army, combined Qing and Jiao clan army: `Qing-Jiao Army` (276x, ch 614-973) / `New Army` (14x, ch 606-648) / `Qing Jiao` (4x, ch 624-649)  [glossary: `Qing-Jiao Army`]
- Soul Formation realm: `Soul Formation` (283x, ch 203-1023) / `Soul Transformation` (5x, ch 217-652)  [glossary: `Soul Formation`]
- Flying Cloud Assembly, sect recruitment event: `Flying Cloud Assembly` (180x, ch 588-1028) / `Soaring Cloud Assembly` (4x, ch 618-763)  [glossary: `Flying Cloud Assembly`]
- Divine Sea / Essence Sea (dantian sea): `Divine Sea` (84x, ch 120-976) / `Essence Sea` (53x, ch 124-973)  [glossary: `divine sea`]
- Lava Immortal Palace master selection contest: `palace examination` (122x, ch 211-330) / `palace trials` (6x, ch 287-326) / `imperial examination` (5x, ch 267-313)
- Commerce Hall of Myriad Manifestations Sect: `Commerce Hall` (87x, ch 670-968) / `Trade Hall` (4x, ch 674-773)
- Human Tribulation: `Human Tribulation` (77x, ch 649-971) / `Child of Destiny` (12x, ch 397-865)
- Martial Arts Hall of Myriad Manifestations Sect: `Martial Arts Hall` (52x, ch 672-912) / `Martial Hall` (7x, ch 677-808)
- Imperial Guard: `Imperial Guard` (33x, ch 153-1014) / `Forbidden Army` (4x, ch 451-693)  [glossary: `Imperial Guard`]
- Fire Cloud Battalion - Two Note fire-spell battalion: `Fire Cloud Battalion` (23x, ch 433-559) / `Fire Cloud Camp` (10x, ch 420-547)
- Spirit classification stage, intelligent spirit: `Wisdom Spirit Stage` (16x, ch 140-865) / `Intelligent Spirit Stage` (6x, ch 140-699)
- Foreign Affairs Hall of Myriad Manifestations Sect: `Foreign Affairs Hall` (18x, ch 672-970) / `Hall of External Affairs` (4x, ch 671-671)
- Heavenly divine authority: Underworld Celestial Heavens / Nether Heave: `Underworld Celestial Heavens` (10x, ch 625-784) / `Nether Heavens` (10x, ch 658-668)
- Thousand Man Soul, soul-strength unit used by Ning Zhuo: `Thousand Man Soul` (8x, ch 596-603) / `Million Man Soul` (3x, ch 602-603)

### place

- Fire Persimmon Immortal City (main city setting): `Fire Persimmon Immortal City` (580x, ch 1-1013) / `Fire Persimmon Mountain` (276x, ch 1-813) / `Fire Persimmon Forest` (85x, ch 18-324) / `Fire Persimmon City` (46x, ch 15-373) / `Lava Immortal City` (28x, ch 106-487) / `Lava Mountain` (9x, ch 109-410)  [glossary: `Fire Persimmon Immortal City`]
- Forgetful River, Underworld river and prefecture: `Forgetful River` (831x, ch 543-1014) / `River of Oblivion` (21x, ch 592-655) / `Forgotten River` (14x, ch 592-681) / `River of Forgetfulness` (6x, ch 593-668)  [glossary: `Forgetful River`]
- White Paper Immortal City (city): `White Paper Immortal City` (620x, ch 575-1020) / `Whitepaper City` (5x, ch 572-572)  [glossary: `White Paper Immortal City`]
- Two Notes Country, small kingdom south of North Wind: `Two Note Kingdom` (171x, ch 430-984) / `Two Note Nation` (161x, ch 434-569) / `Two Note Country` (79x, ch 421-587)  [glossary: `Two Note Kingdom`]
- Flying Cloud Kingdom caravan: `Cloud Kingdom` (204x, ch 100-1014) / `Flying Cloud Kingdom` (200x, ch 100-1014) / `Flying Cloud Nation` (4x, ch 584-735)  [glossary: `Flying Cloud Kingdom`]
- Southern Bean polity that rules Fire Persimmon City: `Southern Bean Kingdom` (277x, ch 15-781) / `Southern Bean royal family` (26x, ch 18-486) / `Southern Bean Country` (25x, ch 128-566) / `South Bean` (18x, ch 371-566) / `Southern Bean Immortal` (8x, ch 18-133) / `Southern Bean Nation` (6x, ch 365-523)  [glossary: `Southern Bean Kingdom`]
- Flowing Cloud Peak / Ferry (place): `Flowing Cloud Peak` (374x, ch 670-1024) / `Flowing Cloud Ferry` (10x, ch 941-949)
- Myriad Medicine Valley / Sect: `Myriad Medicine Sect` (207x, ch 351-826) / `Thousand Medicines Sect` (40x, ch 411-759) / `Ten Thousand Medicines Valley` (24x, ch 350-731) / `Myriad Medicine Valley` (16x, ch 351-371)
- Demonic trial gate route (Demon Gate): `Demonic Path` (151x, ch 170-990) / `Demonic Gate` (24x, ch 173-291)
- Profound Armory Peak / Profound Armor Cave (place): `Profound Armor Cave` (170x, ch 749-981) / `Profound Armory Peak` (6x, ch 918-918)
- White Jade military camp: `White Jade Camp` (118x, ch 418-566) / `White Jade Battalion` (49x, ch 439-565) / `White Jade Army` (6x, ch 418-508)
- Green Forest immortal city (Celestial City of Green Forest): `Forest Immortal City` (63x, ch 426-568) / `Celestial City of Green Forest` (34x, ch 418-430)
- Artifact Refining Hall of Myriad Manifestations Sect (Tie Kuang's hall: `Artifact Refining Hall` (87x, ch 672-1028) / `Artifact Forging Hall` (21x, ch 885-1015)
- Heavy Formation Peak (Sect Leader faction): `Heavy Formation Peak` (82x, ch 670-1019) / `Heavy Array Peak` (30x, ch 674-988)
- Little Contention Peak (Small Contest Peak): `Little Contention Peak` (62x, ch 353-487) / `Great Contention Peak` (14x, ch 353-407) / `Small Contest Peak` (12x, ch 351-402) / `Small Dispute Peak` (3x, ch 376-398)
- Palace archive (Historical Records Pavilion): `Historical Records Pavilion` (68x, ch 222-294) / `Historical Pavilion` (19x, ch 216-266.5)
- Buddhist trial gate route (Buddha Gate): `Buddha Gate` (26x, ch 115-209) / `Buddhist Gate` (25x, ch 144-299) / `Buddhist Sect` (20x, ch 123-961) / `Buddhist Path` (12x, ch 143-579)
- Fog/Mist Concealment Mountain (Fox God domain): `Cloud Concealment Mountain` (42x, ch 336-523) / `Mist Concealment Mountain` (19x, ch 338-567) / `Fog Shrouded Mountain` (11x, ch 344-345) / `Misty Hidden Mountain` (8x, ch 335-567)
- Azure Stone Cave Mansion: `Bluestone Cave Dwelling` (27x, ch 831-888) / `Green Stone Cave Abode` (11x, ch 702-815) / `Blue Stone Cave Abode` (11x, ch 723-837) / `Azure Stone Cave Mansion` (10x, ch 700-733) / `Bluestone Cave Manor` (3x, ch 850-904)
- Demon cave of Great Contention Peak: `Ten Thousand Demons Cave` (23x, ch 374-407) / `Demon Cave` (12x, ch 107-407) / `Ten Thousand Beasts Cave` (11x, ch 350-397) / `Monster Cave` (6x, ch 398-398) / `Wan Yao Cave` (3x, ch 377-377)
- Myriad Beasts Peak (Myriad Beast Peak): `Myriad Beasts Peak` (39x, ch 670-929) / `Ten Thousand Beasts Peak` (7x, ch 727-1028)
- Yugang mining town and mountain: `Jade Steel` (45x, ch 341-514) / `Yugang Mountain` (9x, ch 340-410) / `Yu Gang` (7x, ch 343-348)
- Daoist trial gate route (Dao Gate): `Dao Gate` (40x, ch 115-534) / `Daoist Path` (15x, ch 170-222)
- Dragon King Giant Wood Mountain (temple mountain): `Dragon King Giant Wood Mountain` (21x, ch 517-547) / `Giantwood Mountain` (13x, ch 491-561)
- Jade Cleansing Hall: `Jade Cleansing Hall` (28x, ch 683-761) / `Jade Cleansing Pavilion` (14x, ch 684-878) / `Jade Rinse Retreat` (4x, ch 671-681)
- Violet/Purple Thunder Peak (Main Peak): `Purple Thunder Peak` (28x, ch 670-1028) / `Violet Thunder Peak` (10x, ch 672-712)
- Floating Magnetic Immortal City: `Floating Magnetic` (29x, ch 342-345) / `Floating Magnet Immortal City` (4x, ch 343-343)
- Northern Wind Kingdom: `Northern Wind Kingdom` (22x, ch 19.5-785) / `North Wind Nation` (4x, ch 417-569)
- Crimson Flame Demon Cave near palace entrance: `Scarlet Flame Monster Volcanic Cavern` (23x, ch 3-93) / `Crimson Flame Demon Cave` (3x, ch 107-107)
- Bikun Mountain / Bikun Pool (Azure Pool area): `Bikun` (17x, ch 495-528) / `Bikuang` (5x, ch 499-499) / `Bikong` (4x, ch 498-533)
- restricted treatment room inside the Medical Pavilion: `critical care room` (9x, ch 267-286) / `severe treatment room` (7x, ch 254-274)
- Coiling Vine Peak - Bi Tengyi's vine-waterfall stronghold: `Qiu Teng Peak` (12x, ch 550-551) / `Coiling Vine Peak` (5x, ch 561-561)
- Light-Sealing Pavilion / Watchtower (Sun-Supporting altar inner struct: `Light-Sealing Pavilion` (7x, ch 1016-1016) / `Sun-Supporting Light-Sealing Pavilion` (6x, ch 1016-1016) / `Sun-Supporting Light-Closing Watchtower` (3x, ch 1017-1017)
- Yu Heye's cave residence: `Boulder Cave` (8x, ch 673-688) / `Boulder Cave Residence` (3x, ch 673-680)
- Children's Care Center, orphanage in Fire Persimmon Immortal City: `Children's Care Center` (12x, ch 92-98) / `Children's Garden` (3x, ch 92-92)
- Cloud Merchant trade district in Fire Persimmon: `Cloud City` (7x, ch 238-339) / `Cloud Market` (3x, ch 240-241)
- Great Noon Heaven Terrace: `Great Noon Heaven Terrace` (7x, ch 993-1004) / `Great Noon Heavenly Plateau` (4x, ch 1000-1000)

### sect

- Ning family clan: `Ning family` (1001x, ch 101-799) / `Ning Clan` (408x, ch 1-1025)  [glossary: `Ning Clan`]
- Myriad Manifestations Sect, major sect that Meng Yaoyin belonged to: `Myriad Manifestations Sect` (1099x, ch 573-1028) / `Myriad Phenomena Sect` (6x, ch 665-763)  [glossary: `Myriad Manifestations Sect`]
- Zheng family (Zheng Shuangjun's clan): `Zheng family` (278x, ch 105-514) / `Shuang family` (3x, ch 216-459)
- Ban family (Ban Ji's clan): `Ban Clan` (226x, ch 699-933) / `Ban Family` (15x, ch 710-877)
- Death-Facing Sect: `Death-Facing Sect` (209x, ch 946-1024) / `Facing Death Sect` (10x, ch 912-946)
- Earth Expansion Alliance / Stone-alliance variants (faction): `Earth Expansion Alliance` (118x, ch 912-1002) / `Kuotu Alliance` (11x, ch 950-957) / `Stone Alliance` (6x, ch 912-942) / `Metal and Stone Alliance` (4x, ch 912-942)
- Barbarian Demon Camp (Xu Dali's army): `Barbarian Demon Camp` (80x, ch 420-521) / `Barbarian Demon Battalion` (6x, ch 439-525)
- Thunder Cloud / Thundercloud Society (faction): `Thunder Cloud Society` (20x, ch 911-949) / `Thunder Cloud Association` (5x, ch 934-951)
- Qing Clan / Ghost Clan Qing Family: `Qing Clan` (25x, ch 609-669) / `Qing Family` (5x, ch 615-655)
- Grand Marshal Mu's household mansion (Mu Lan's family): `Grand Marshal Mu` (12x, ch 461-525) / `Mu Marshal` (5x, ch 478-478)

### technique

- Life-binding soul-thread divine ability used by Dragon Turtle Fire Spi: `Life Hanging by a Thread` (363x, ch 102-1020) / `Life Thread` (33x, ch 106-600) / `Life Hanging by a Thread Divine Ability` (33x, ch 162-973) / `Life-Thread Connection` (10x, ch 410-410) / `Thread of Fate` (9x, ch 109-110) / `Life Thread Divine Ability` (8x, ch 120-354)  [glossary: `Life Hanging by a Thread`]
- Demonic Pollution Blood Sinew Technique, demonic method used in the De: `Demonic Blood Vein Technique` (113x, ch 102-621) / `Demonic Pollution Blood Sinew Technique` (23x, ch 50-100)
- Sage's Great Thief Scripture (Qin De's cultivation art; spelling varie: `Sage's Great Thief Scripture` (35x, ch 847-866) / `Sage Great Thief Sutra` (10x, ch 782-840)
- Bitter cold leg martial technique (Old Frost Leg family): `Cold Leg` (27x, ch 370-937) / `Old Cold Leg` (24x, ch 374-937) / `Frozen Leg` (3x, ch 369-369)
- Ning Ice Jade Hand technique: `Ice Jade Hand` (47x, ch 140-695) / `Frozen Fat Jade Hands` (6x, ch 122-122)
- Myriad Methods / Myriad Laws demonic art family (Demonic Descent/Fall/: `Myriad Methods Demonic Descent Art` (14x, ch 843-843) / `Myriad Laws Demonic Fall Art` (9x, ch 851-851) / `Myriad Methods Falling Demon Art` (9x, ch 842-842) / `Myriad Methods Demonic Fall Art` (7x, ch 855-856) / `Myriad Laws Demonic Corruption Art` (4x, ch 848-848)
- Spirit communication cultivation method: `Mirror Platform Spirit Communication Technique` (33x, ch 123-612) / `Mirror Platform Penetrating Method` (3x, ch 336-336) / `Mirror Platform Spirit-Linking Art` (3x, ch 479-479)
- Fire Burial Prajna spirit sutra (Fire Burial / Cremation sutra): `Fire Burial Prajna Spirit Unbinding Sutra` (27x, ch 104-433) / `Fire Burial Prajna Spirit Dissolution Sutra` (8x, ch 171-173) / `Fire Burial Sutra` (4x, ch 171-177)
- Shouzhuo Wheel Slash / Rotation Formation (formation): `Shouzhuo Wheel Slash Formation` (18x, ch 936-981) / `Shouzhuo Wheel` (18x, ch 936-981) / `Shouzhuo Rotation Formation` (5x, ch 935-935)
- Iron Bucket Formation - Three Generals' defensive formation: `Iron Bucket Formation` (26x, ch 436-681) / `Iron Barrel Formation` (9x, ch 445-533)
- Mirror Platform Spirit Communication Incantation, the Buddha door tech: `Mirror Platform Spirit Communication Incantation` (15x, ch 50-100) / `Mirror Platform Spiritual Technique` (10x, ch 102-579) / `Mirror Platform Spiritual Communication Technique` (5x, ch 109-582)
- Iron Flow military strategy (Du Tiechuan): `Iron Flow Levels the Plains` (18x, ch 514-518) / `Iron Torrent Flattening the Plains` (5x, ch 507-507)
- Bitter Cold Sutra, Han Zhou's Buddhist cold cultivation method: `Bitter Cold Sutra` (25x, ch 357-815) / `Frost Sutra` (10x, ch 369-369)
- Five Organs Temple Divine Art, Five Elements technique: `Five Organs Temple Divine Art` (25x, ch 386-433) / `Five Organs Temple Spirit Technique` (5x, ch 395-408)
- Little Thief's Light Breeze Formation (Light Body Swift Wind Formation: `Light Body Swift Wind Formation` (12x, ch 483-693) / `Little Thief's Light Breeze Formation` (10x, ch 476-558)
- Meng Kui divine ability for fate-energy field: `Sitting Mountain Observation Technique` (14x, ch 134-278) / `Mountain Watching Technique` (7x, ch 120-125)
- Ning Xie's innate talent (Snow Soul Ice Essence): `Snow Soul Ice Spirit` (12x, ch 179-792) / `Snow Soul Ice Essence` (10x, ch 180-695)
- Void Sect anti-soul-search seal: `Void Seal` (9x, ch 132-595) / `Void Emptiness Seal` (7x, ch 126-195) / `Void Imprint` (3x, ch 126-126)
- Spirit God Art / Five Viscera Temple Spirit Art: `Five Viscera Temple Spirit Art` (9x, ch 657-998) / `Spirit God Art` (6x, ch 655-733)  [glossary: `Five Viscera Temple Spirit Art`]
- Sun Lingtong's Pure Yang Body / Virgin Boy Technique: `Virgin Boy Technique` (12x, ch 200-604) / `Pure Yang Body` (5x, ch 171-199)
- Five Elements Creation and Destruction Art: `Five Elements Creation and Destruction Art` (7x, ch 688-837) / `Five Qi Generation and Destruction Art` (5x, ch 687-687)
- Soul-Searching Art/Technique: `Soul-Searching Art` (10x, ch 722-751) / `Soul-Searching Technique` (3x, ch 723-723)
- Cheng Bai's innate talent eyes: `Netherworld Death Eyes` (9x, ch 129-146) / `Nether Death Eye` (3x, ch 135-137)
- Chui Xu Ke long whip technique: `Death Whip` (8x, ch 37-693) / `Hanging Death Whip` (4x, ch 135-139)
- Wood spell trapping foes in tree forest, Ning Zhuo's technique: `Tree Realm Descent` (9x, ch 378-492) / `Tree World Descends` (3x, ch 377-377)
- Red Heart Hawk Arrow - Mu Lan's divine ability arrow: `Scarlet Heart Homing Arrow` (7x, ch 560-570) / `Red Heart Hawk Arrow` (3x, ch 552-552)
- Myriad Manifestations Cradle: `Cradle of Myriad Phenomena` (6x, ch 704-997) / `Myriad Manifestations Cradle` (5x, ch 705-1014)
- Primordial Form-Cutting technique (Scripture/Scroll): `Grand Primordial Form-Cutting Scripture` (6x, ch 821-821) / `Great Primordial Form-Cutting Scroll` (5x, ch 822-822)
- Spirit-Motion Stage: `Spirit-Motion Stage` (4x, ch 699-699) / `Spirit Resonance Stage` (4x, ch 701-701)
- Ghost Mask Technique - Ghost art borrowing a great ghost's power: `ghost face technique` (3x, ch 540-540) / `Ghost Mask Technique` (3x, ch 538-538)

### title

- Ning family head (patriarch / clan leader): `Clan Leader` (96x, ch 159-733) / `family patriarch` (89x, ch 154-605) / `head of the Ning family` (7x, ch 270-271)
- True Inheritor / true disciple of the Great Purity Palace (title): `true disciple` (90x, ch 125-598) / `True Inheritor` (37x, ch 232-737) / `Golden Core True Disciple` (18x, ch 589-790)  [glossary: `Golden Core True Disciple`]
- Lord Shutu, True Lord of the Prison Guard: `Lord Shutu` (78x, ch 776-811) / `True Lord Shutu` (59x, ch 776-811)
- Ning Zhuo's military title: `Military Advisor` (75x, ch 403-556) / `Military Strategist` (39x, ch 457-1027)
- Forms of address for Yuan Dasheng (Monkey Head Gang): `Uncle Monkey` (63x, ch 57-132) / `Uncle Dasheng` (11x, ch 57-121) / `Lord Monkey` (3x, ch 57-58)
- Qingwu Langjun, senior figure (Lord Qingwu): `Lord Qingwu` (44x, ch 770-1003) / `Qing Wu Langjun` (11x, ch 772-779)
- Ning Jiufan (Golden Core ancestor of Ning family): `Golden Core ancestor` (29x, ch 21-486) / `Golden Core Patriarch` (20x, ch 120-417)
- Author's other novel (possibly the same work): `Infinite Bloodcore` (5x, ch 156.5-327.1) / `Xiangong Kaiwu` (3x, ch 156.6-327.1)

### character

- Meng Yaoyin puppet/title (chunk 11, worker candidates): `Buddhist Doctor - Meng Yaoyin` (111x, ch 328-913) / `Buddha Doctor` (53x, ch 324-632) / `Buddha Healer` (11x, ch 135-333) / `Buddha Physician` (11x, ch 322-706) / `Monk Doctor` (9x, ch 321-321)  [glossary: `Buddhist Doctor - Meng Yaoyin`]

### creature

- Dasheng mechanical ape (chunk 11, worker candidates): `Golden Blood Battle Ape` (252x, ch 82-354) / `Heavy Armored Blood Ape` (31x, ch 317-1013)  [glossary: `Heavy Armored Blood Ape - Dasheng`]

### item

- Night Rain weapon (chunk 11, worker candidates): `Night Rain Demon Weapon` (38x, ch 192-402) / `Serpent Scythe` (31x, ch 233-878) / `Great Serpent Scythe` (27x, ch 325-878)

### character

- Zheng Danlian (chunk 11, worker candidates): `Zheng Danlian` (189x, ch 143-328) / `Zheng Dan` (4x, ch 242-318)

### item

- Cloud bud (chunk 11, worker candidates): `Cloud Concealment Bud` (13x, ch 198-338) / `Cloud-Hidden Bud` (6x, ch 323-323)

### technique

- Jade Pillar technique (chunk 11, worker candidates): `Jade Pillar Body` (5x, ch 309-317) / `Jade Pillar Posture` (5x, ch 310-325)
- Cremation Prajna sutra (chunk 11, worker candidates): `Fire Burial Prajna Spirit Unbinding Sutra` (27x, ch 104-433) / `Cremation Prajna Spirit Release Sutra` (17x, ch 632-1014)  [glossary: `Cremation Prajna Spirit Release Sutra`]

### place

- Gourd forest (chunk 11, worker candidates): `Fire Persimmon Forest` (85x, ch 18-324) / `Gourd Fire Furnace Forest` (13x, ch 268-326)

### other

- Dao injury (chunk 11, worker candidates): `Dao Injury` (25x, ch 419-878) / `Dao wound` (8x, ch 321-424)  [glossary: `Dao Injury`]

### place

- Fire Persimmon city (chunk 11, worker candidates): `Fire Persimmon Immortal City` (580x, ch 1-1013) / `Fire Persimmon City` (46x, ch 15-373)  [glossary: `Fire Persimmon Immortal City`]
