# dsh-plugin-upgrade-016

DeepSeek Harness hop `0.1.5-rc.2 → 0.1.6-alpha.2` के लिए **क्लोज़्ड-कॉरिडोर अपग्रेड स्किल और स्कैनर**। यह एक वर्शन-लॉक्ड कॉरिडोर कार्ड और **पाँच-सीम कैटलॉग** पर एक ज़ीरो-डिपेंडेंसी सीम स्कैनर पैक करता है — हर सीम `error`-सेवेरिटी की है और हर सीम में डिटेक्टर है:

| सीम | टूटना |
|---|---|
| `E1` | थ्रो करने वाला (या इनलाइन धीमा काम करने वाला) `agent/created` लिस्नर एजेंट निर्माण रोक देता है — होस्ट उसे सीरियल चेन पर डिस्पैच करता है। |
| `E2` | एसिंक `apply` रेस: पहले `await` के बाद कोई भी रजिस्ट्रेशन अनलोड विंडो में `INACTIVE_EFFECT` से मरता है। |
| `E3` | हटाई गई स्लॉट/स्टेट कीज़: `settings.plugin.item` (→ `plugins.item`) और `SessionListState.current` — दोनों **चुपचाप** फेल होती हैं। |
| `E4` | हटाई गई क्लाइंट APIs `sessions.open/openSubagent/clear` (→ `retain`/`using`/`retainInfo`) — क्लिक पथ थ्रो करते या एरर निगल जाते हैं। |
| `E5` | हटाए गए मॉडल लिटरल `deepseek-v4-flash*`/`deepseek-v4-vision-exp` — बिना कैटलॉग वाले ids टेक्स्ट-ओनली रूट होते हैं। |

पैकेज एक **बंडल स्किल** है (मॉडल कार्ड सिर्फ़ तब देखता है जब टास्क को ज़रूरत हो) साथ ही प्लगइन लेखकों के लिए एक **npx CLI**। यह `dsh-plugin-upgrade-015` (जो `0.1.3-alpha.1 → 0.1.5-rc.1` कॉरिडोर का मालिक है) को न बदलता है न उससे कुछ साझा करता है: कॉरिडोर कभी चौड़ा नहीं होता, और सीम जोड़ने वाला hop एक नया पैकेज है।

## What it is

- `skills/plugin-upgrade-016/` — बंडल की गई एजेंट स्किल: फ्रंटमैटर रूटिंग, फिक्स-एंड-वेरिफ़ाई लूप, और `references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md` (वर्शन कार्ड: हर सीम का सबूत, फिक्स रेसिपी और एग्ज़िट मापदंड)।
- `lib/scan-0.1.6.mjs` — ज़ीरो-डिपेंडेंसी स्कैनर (सिर्फ़ Node stdlib)। जन्म से ही सख़्त: `lib/` **स्कैन होता है** (कमिट किए गए बिल्ड आर्टिफ़ैक्ट पुरानी सीम यूज़र तक पहुँचाते हैं), हर लाइन-लेवल व्यवहार एक कैटलॉग फ़ील्ड है और रेंडर क्रम कैटलॉग से निकलता है।
- `scripts/scan-0.1.6.mjs` — CLI (`npx dsh-plugin-upgrade-016-scan --repo <path>`); exit 0 = कोई एरर हिट नहीं, exit 1 = कम से कम एक।
- `docs/EVIDENCE.md` — हर सीम के पीछे कमांड→आउटपुट रिकॉर्ड।

साफ़ स्कैन **ज़रूरी है, काफ़ी नहीं**: इस कॉरिडोर की टूट दोनों सिरों से ख़ामोश है। असली-होस्ट स्मोक, लॉग लेखकों के लिए resume राउंड-ट्रिप और क्लाइंट हाफ़ के लिए असली ब्राउज़र एसर्शन से सत्यापित करें।

## Quick start

```sh
dsh plugin --profile web add dsh-plugin-upgrade-016
npx dsh-plugin-upgrade-016-scan --repo <your-plugin-repo>
```

स्किल ख़ुद को रूट करती है: जब टास्क किसी प्लगइन रेपो को `0.1.5-rc.2 → 0.1.6-alpha.2` के पार माइग्रेट करना हो, तो मॉडल बंडल किया कार्ड लोड करता है और फिक्स-एंड-वेरिफ़ाई लूप चलाता है।

## Scanner usage

```sh
node scripts/scan-0.1.6.mjs [--repo <path>] [--json <out.json>] [--seams E1,E3] [--quiet]
```

एग्ज़िट कोड: `0` = कोई एरर-सेवेरिटी हिट नहीं · `1` = कम से कम एक एरर हिट · `2` = यूसेज विफलता। स्कैनर रीड-ओनली है: स्कैन की गई ट्री में कभी लिखता नहीं।

## The five seams

पूरा सबूत और फिक्स रेसिपी वर्शन कार्ड में है (`skills/plugin-upgrade-016/references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md`)। संक्षिप्त रूप:

- **E1** — `agent/created` लिस्नर में कभी थ्रो न करें; सिंक काम try/catch में लपेटें, भारी काम टालें (`queueMicrotask`/`setImmediate`/अपनी क़तार)।
- **E2** — एसिंक `apply` के पहले `await` से पहले सब कुछ रजिस्टर हो; `register()` के रिज़ल्ट `ctx.effect()` को दें।
- **E3** — सेटिंग्स कार्ड `plugins.item` पर माउंट हों (लिस्ट स्लॉट: `id`/`order`/`label`, props `{view:'summary'|'page'}`); मौजूदा सेशन स्टैंडर्ड props (`sessionId`/`useSessionStatus`/`retainedBy.mainView`) से निकले, कभी `list.current` से नहीं।
- **E4** — `sessions.retain(id, { source })` से नेविगेट करें; लौटा handle सहेजें और डिस्पोज़ करें।
- **E5** — मॉडल लिटरल alpha.2 कैटलॉग के भीतर रहें; `deepseek-v4-flash*`/`deepseek-v4-vision-exp` बदलें।

## Configuration

हर नॉब एक Schemastery `Config` फ़ील्ड है, `cordis.patch.yml` में इनलाइन दस्तावेज़ित:

- `enabled` (डिफ़ॉल्ट `true`) — बंडल की गई स्किल रजिस्टर करें।
- `skillName` (डिफ़ॉल्ट `plugin-upgrade-016`) — मॉडल कैटलॉग में प्रकाशित स्किल नाम।
- `skillsRoot` (डिफ़ॉल्ट पैकेज का अपना `skills/`) — इसमें `<skillName>/SKILL.md` होना चाहिए।
- `userInvocable` (डिफ़ॉल्ट `true`) — मॉडल के अलावा यूज़र से भी इनवोकेबल।

## Development

```sh
pnpm install
pnpm test                    # स्कैनर फ़िक्सचर्स + कार्ड↔कैटलॉग पैरिटी + असली Cordis माउंट
pnpm run check:readmes       # पाँच-भाषा README सिंक
pnpm run verify:self-contained
pnpm run verify:artifacts    # pack + टारबॉल निरीक्षण
pnpm pack
```

## Topics

`dsh` · `dsh-plugin` · `deepseek-harness` · `deepseek` · `cordis` · `plugin-upgrade` · `migration` · `skill` · `version-card` · `scanner` · `client-slots`

## License

Apache-2.0। `LICENSE` और `THIRD_PARTY_NOTICES.md` देखें।
