LanguagePack = require '../core/language-pack'

module.exports =
class Core extends LanguagePack
  constructor: ->
    super 'core'

    @decalreAlias '^',      /^\ {0, 3}/
    @decalreAlias '$',      /$/
    @decalreAlias ' ',      /\s+/
    @decalreAlias '#',      /#{1, 6}/
    @decalreAlias '- - -',  /([*+-]\s?){3,}/
    @decalreAlias '===',    /[-=]{3,}/
    @decalreAlias '->',     /^(\t|\ {4})/
    @decalreAlias '```',    /[~`]{3,}/

    @declareDelimiterPair '(', ')'
    @declareDelimiterPair '[', ']'
    @declareDelimiterPair '{', '}'
    @declareDelimiterPair '<', '>'
    @declareDelimiterPair '```'

    @addBlockRule 'rules', ['^', '- - -', '$']

    @addBlockRule 'atx_header', ['^', '#', ' ', /(.*)\s*/, '$'],
      1: @emitAttribute 'level', (hash) -> hash.length
      3: @emitContent   'title'

    @addBlockRule 'setext_header', ['^', /([^\s].*)\n/, '===', '$'],
      1: @emitContent   'title'
      2: @emitAttribute 'level', (r) -> if r[0] == '-' then 1 else 2

    @addBlockRule 'indented_code', ['->', /(.*)/, '$'],
      1: @emitText      'src'

    @addBlockRule 'fenced_code', ['^', '```', '$', /([^]*)/, '^', '```', '$'],
      3: @emitText      'src'

    @addBlockRule 'html'

    @addBlockRule 'link_ref'

    @addBlockRule 'paragraph'

    @addBlockRule 'blank_line'

    # TBD: aggregate `list_item` into one `*_list` element later
    #      or emit directly
    # @addBlockRule 'ordered_list'
    #
    # @addBlockRule 'unordered_list'

    @addBlockRule 'list_item'

    @addInlineRule 'backslash_escape'

    @addInlineRule 'entity'

    @addInlineRule 'code_span'
