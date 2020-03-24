# nlogs

new custom logger for Node.js

## Install 

```
npm i nlogs
```
or:
```
yarn add nlogs
```


## Use 

```js
const logger = require('nlogs')(module, {/* config */})
```
```js
const Logger = require('nlogs')
const { NLogger }  = require('nlogs')

const logger1 = Logger(/* filename */, {/* config */})
const logger2 = new NLogger(/* filename */, {/* config */})
```

---

### Logger methods

> Most methods repeat console methods

```js
logger.log('text')
logger.info('text')
logger.debug('text')
logger.warn('text')
logger.error('text')
logger.time('text')
logger.timeLog('text')
logger.timeEnd('text')
logger.dir({ a: 1})
logger.table([
    { a: 1 }
])
```

**format messages:**
`short time` `file segments` `label` `message`
```
 ..22:40:33 nlogs/lib/test.js info   message
```

---

### Params:

#### filename

**String**

```js
const Logger = require('nlogs')

const logger = Logger('/Users/mac/nlogs/lib/file.js')
```

**Object** or **Module**

```js
const Logger = require('nlogs')

const logger = Logger({
    filename: '/Users/mac/nlogs/lib/file.js'
})
```

or:

```js
const logger = require('nlogs')(module)
```

**import.meta**

```js
import Logger from 'nlogs'

const logger = Logger(import.meta)
```

---

#### config 

optional argument. An object 
> [default config](https://github.com/nerjs/nlogs/blob/master/lib/defaultConfig.js)

###### Style
> **Style** property is an Array of Strings
> For styling, the [colors](https://github.com/Marak/colors.js#colorsjs) module is used. But you can use [your own](#formatters).

|prop name|type|default|description|
|:--:|:--:|:--:|:--|
|***time***|**Style**|`['gray', 'bgBlack']`|style for default build time label|
|***label***|**Style**|`['white', 'bold']`|style for default build methodName label|
|***segments***|**[Segment](#segments)**||style for default build segments (path & moduleName) label|
|***formatters***|**[Formatters](#formatters)**||custom formatters|
|***enableFileLink***|**Boolean**|`true`| [terminal-link](https://github.com/sindresorhus/terminal-link#readme)|
|***groupedEveryTime***|`'minute' | 'hour' | 'day' | null `|`'hour'`|if not NULL, each time the indicated timestamp of the log does not match the previous one, an additional message is displayed indicating the full date and time|
|***methods***|**[Methods](#methods)**||config for each method|


##### Formatters

> formatters are Functions

|prop name|arguments|default|description|
|:--:|:--:|:--:|:--|
|***string***|**String**, **[Styles](#style)**|[stringFormatter](https://github.com/nerjs/nlogs/blob/master/lib/stringFormatter.js)|format string labels with styles|
|***time***|**timestamp**, **isShort: Boolean**|[timeFormatter.js](https://github.com/nerjs/nlogs/blob/master/lib/timeFormatter.js)|format time labels|

##### Segments 

> segments is the converted path to the file relative to the root (at the level of the nearest package.json

**Example:**

filename: `/Users/mac/nlogs/lib/file.js`
package.json: `/Users/mac/nlogs-directory/package.json`
package name: `nlogs`

result: `nlogs/lib/file.js`

> Each property describes a style as an array of strings.

|prop name|default|description|
|:--:|:--:|:--|
|***first***|`['yellow', 'italic', 'dim']`|first segment (moduleName)|
|***last***|`['cyan', 'italic']`|filename style|
|***all***|`['grey', 'italic']`|path sections (from module dir to filename)|
|***delimiter***|`['gray']`|separator path sections. `path.sep` from module `path`|


##### methods

> Settings for each of the [methods](#logger-methods) separately. 

* log
* info
* debug
* warn
* error
* time (*time*, *timeEnd*, *timeLog* methods)
* dir
* table

> Some properties, in their absence, are taken from the [config](#config) 

**method config**

|prop name|type|description|
|:--:|:--:|:--|
|***show***|**Boolean**|Sets whether this method works|
|***time***|**[Style](#style)**|style for method build time label. If not specified, use default|
|***segments***|**[Segments](#segments)**|style for method build segments (path & moduleName) label. If not specified, use default|
|***label***|**[Style](#style)**|style for method build methodName label. If not specified, use default|
|***showStartTimer***|**Boolean**|Show message when invoking logger.time()? Only time method|
|***warningPresentLabel***|**Boolean**|warning if the label exists when invoking logger.time(). Only time method|
|***warningMissingLabel***|**Boolean**|warning if the label does not exist when invoking logger.timeEnd() and logger.timeLog(). Only time method|
|***changePresentLabel***|**Boolean**|overwrite the label if one already exists. Only time method|
|***diffTimeColor***|**[Style](#style)**|diff time style. Only time method|
|***depth***|**Number**|depth param to dir method|


### Global configs

```js
const { getConfig, setConfig } = require('nlogs')
```