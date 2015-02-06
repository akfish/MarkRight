LanguagePack = require '../core/language-pack'

module.exports =
class Core extends LanguagePack
  constructor: ->
    super 'core'

    @declareAlias '^',      /^\ {0, 3}/
    @declareAlias '$',      /$/
    @declareAlias ' ',      /\s+/
    @declareAlias '#',      /#{1, 6}/
    @declareAlias '- - -',  /([*+-]\s?){3,}/
    @declareAlias '===',    /[-=]{3,}/
    @declareAlias '->',     /^(\t|\ {4})/
    @declareAlias '```',    /[~`]{3,}/

    @declareDelimiterPair '(', ')'
    @declareDelimiterPair '[', ']'
    @declareDelimiterPair '{', '}'
    @declareDelimiterPair '<', '>'
    @declareDelimiterPair '```'

    @addBlockRule 'rules', ['^', '- - -', '$']

    @addBlockRule 'atx_header', ['^', '#', ' ', /(.*)\s*/, '$'],
      1: @emit.attribute 'level', (hash) -> hash.length
      3: @emit.content   'title'

    @addBlockRule 'setext_header', ['^', /([^\s].*)\n/, '===', '$'],
      1: @emit.content   'title'
      2: @emit.attribute 'level', (r) -> if r[0] == '-' then 1 else 2

    @addBlockRule 'indented_code', ['->', /(.*)/, '$'],
      1: @emit.text      'src'

    @addBlockRule 'fenced_code', ['^', '```', '$', /([^]*)/, '^', '```', '$'],
      3: @emit.text      'src'

    @addBlockRule 'html', []

    @addBlockRule 'link_ref', []

    @addBlockRule 'paragraph', []

    @addBlockRule 'blank_line', []

    # TBD: aggregate `list_item` into one `*_list` element later
    #      or emit directly
    # @addBlockRule 'ordered_list'
    #
    # @addBlockRule 'unordered_list'

    @addBlockRule 'list_item', []

    @addInlineRule 'backslash_escape', []

    @addInlineRule 'entity', []

    @addInlineRule 'code_span', []
