# core

This document specifies default element templates for Markright `core` language package.

## Block Elements

### rules

```template
<hr />
```

### atx_header

Token Definition:

Field    | Type           | Description
-------- | -------------- | ---------------
`level`  | `int`          | Between 1 ~ 6
`title`  | `markdown`     |

```template
<h{{level}}>{{title}}</h{{level}}>

```

### setext_header

Token Definition:

Field    | Type           | Description
-------- | -------------- | ---------------
`level`  | `int`          | Between 1 ~ 2
`title`  | `markdown`     |

```template
<h{{level}}>{{title}}</h{{level}}>

```

### indented_code

```template
<pre><code>
{{*}}
</code></pre>
```

### fenced_code

Token Definition:

Field      | Type           | Description
---------- | -------------- | ---------------
`lang`     | `string`       |
`content`  | `markdown`     |

```template
<pre><code class="language-{{lang}}">
{{*}}
</code></pre>
```

### html

Token Definition:

Field      | Type           | Description
---------- | -------------- | ---------------
`html`     | `string`       |

```template
{{html}}
```

### link_ref

Token Definition:

Field      | Type           | Description
---------- | -------------- | ---------------
`id`       | `string`       |
`url`      | `string`       |
`title`    | `string`       |

```template

```
(A `link_ref` element corresponds to no visible element)

### paragrah

```template
<p>{{*}}</p>
```

### blank_line

```template

```
(A `blank_line` element corresponds to no visible element)


### blockquote

```template
<blockquote>{{*}}</blockquote>

```

### ordered_list

```template
<ol>
{{*}}
</ol>
```

### unordered_list

```template
<ul>
{{*}}
</ul>
```

### list_item

```template
<li>{{*}}</li>
```

## Inline Elements

### backslash_escape

```template
{{escaped}}
```

### entity

```template
{{entity}}
```

### code_span

```template
<code>{{*}}</code>
```

### em

### link

### auto_link

### image

### raw
