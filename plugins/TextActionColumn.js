Ext.ns('Ext.ux.grid');

/**
 * Делает колонку с текстовыми ссылками-экшнами. Используется следующим образом:
 * в описании колонки ставится xtype: 'textactioncolumn'.
 *
 * Настройка. Параметры, которые дополнительно можно добавить в свойства колонки:
 *
 * actionsSeparator: разделитель между действиями. По умолчанию ' | '
 * items: список действий для колонки. Массив. Элементы массива — объекты со
 * следующими возможными параметрами (все параметры опциональны):
 *
 *   text: текст действия. Может быть строкой или функцией. Параметры те же что
 *   у функции renderer колонки;
 *
 *   handler: действие, которое вызывается при клике на ссылку-действие.
 *     function(grid, rowIndex, colIndex, item, e)
 *
 *   isHidden: bool или функция определяющая, следует ли отображать это действие
 *   в ячейке. Если bool — то распространяется на всю колонку. Функция дергается
 *   по каждой строчке отдельно. Параметры как у render.
 *
 *   isShown: bool или функция, аналогично isHidden только наоборот. Преимущество
 *   имеет isHidden.
 *
 *   href: строка или функция, определяет ссылку, куда перейти по клику.
 *   Параметры функции как у render.
 *   N.B.: Одновременно указывать href и handler бессмысленно, т.к. порядок
 *   вызова перехода и хендлера не определен, и хендлер может выполниться в уже
 *   разрушенном объекте.
 *
 *   cls: класс, дополнительно назначаемый ссылкам-действиям. Строка.
 *
 *   getClass: функция для назначения еще одного дополнительного класса ссылкам-
 *   действиям. Параметры как у render, должно возвращать строку.
 *
 *   tooltip: тултип, отображаемый у ссылки-действия. Строка.
 *
 *   icon: иконка, предваряющая ссылку. Строка, адрес иконки.
 *
 *   iconCls: дополнительный класс у иконки. Строка.
 *
 *   altText: альт-текст у иконки. Строка.
 *
 *   scope: контекст в котором выполнять handler. Если равен строке 'item', то
 *   будет в контексте айтема.
 *
 *   Пример:
 *
 *   columns.push({header: 'Информация', width: 100, xtype:'textactioncolumn', items:[
 *     {
 *      text: 'Пыщ',
 *      handler: function(grid, rowIndex, colIndex, item) {
 *        alert(item.text);
 *      }
 *    }, {
 *      text: 'Пиу',
 *      isHidden: function(v, meta, rec) {
 *        return (some condition);
 *      },
 *      handler: function(grid, rowIndex, colIndex, item) {
 *        alert(item.text);
 *      }
 *    }, {
 *      text: 'Жжжжж',
 *      tooltip: 'Шугум бугум',
 *      href: href_to('procedure/index'),
 *      isHidden: function(v, meta, rec) {
 *        return (some condition);
 *      }
 *    }
 *  ]});
 */
Ext.ux.grid.TextActionColumn = Ext.extend(Ext.grid.Column, {
    header: '&#160;',

    actionIdRe: /x-action-col-(\d+)/,

    /**
     * @cfg {String} altText The alt text to use for the image element. Defaults to <tt>''</tt>.
     */
    altText: '',

    constructor: function(cfg) {
        var me = this,
            items = cfg.items || (me.items = [me]),
          hiddenItem = cfg.hiddenItem || false,
            l = items.length,
            i,
            item;

        Ext.ux.grid.TextActionColumn.superclass.constructor.call(me, cfg);

//      Renderer closure iterates through items creating an <img> element for each and tagging with an identifying
//      class name x-action-col-{n}
        me.renderer = function(v, meta) {
            var scope, t, actions = [], href, cls, text;
//          Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
            v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments)||'' : '';

            meta.css += ' x-action-col-cell x-unselectable ';
            meta.attr = 'unselectable="on"';
            for (i = 0; i < l; i++) {
                item = items[i];
                if ('item'===item.scope) {
                  scope = item;
                } else {
                  scope = item.scope||this.scope||this;
                }
              // если надо одно условие для всех кнопок и строк
              if (Ext.isFunction(hiddenItem)) {
                t = hiddenItem.apply(scope, arguments);
              } else {
                t = hiddenItem;
              }
              if (t) {
                continue;
              }
                if (Ext.isFunction(item.isHidden)) {
                  t = item.isHidden.apply(scope, arguments);
                } else {
                  t = item.isHidden;
                }
                if (undefined === t && undefined !== item.isShown) {
                  if (Ext.isFunction(item.isShown)) {
                    t = !item.isShown.apply(scope, arguments);
                  } else {
                    t = !item.isShown;
                  }
                }
                if (t) {
                  continue;
                }
                if (item.href && Ext.isFunction(item.href)) {
                  href = item.href.apply(scope, arguments);
                } else {
                  href = item.href;
                }
                if (item.text && Ext.isFunction(item.text)) {
                  text = item.text.apply(scope, arguments);
                } else {
                  if (undefined!==item.text) {
                    text = item.text||'';
                  } else {
                    text = (item.text||href||'');
                  }
                }
                if (undefined===item.tooltip && item.text) {
                  item.tooltip = text;
                } else {
                  if (item.tooltip && Ext.isFunction(item.tooltip)) {
                    item.tooltip = item.tooltip.apply(scope, arguments);
                  }
                }
                var extra=[];
                if (item.newWindow) {
                  extra.push('target="_blank"');
                }
                if (extra.length>0) {
                  extra = ' '+ extra.join(' ');
                } else {
                  extra = '';
                }
                cls = 'x-action-col-' + String(i);
                t = '<a href="' + (href||'javascript:;') +
                    '" class="' + cls + ' ' + (item.cls || '') + ' x-action-col-text ' +
                    (Ext.isFunction(item.getClass) ? item.getClass.apply(scope, arguments) : '') + '"'+
                    ((item.tooltip) ? ' ext:qtip="' + item.tooltip + '"' : '') + extra + '>';
                var ico = '';
                if (item.icon) {
                  ico = '<img alt="' + (item.altText||item.tooltip||'') + '" src="' + item.icon + '"' +
                       ((item.tooltip) ? ' ext:qtip="' + item.tooltip + '"' : '') +
                       ' class="' + cls + ' x-action-col-icon '+(item.iconCls || '')+'" /></a>';
                }
                if (text) {
                  if (ico) {
                    t = t+ico+'&nbsp;'+t;
                  }
                  t += text;
                  t += '</a>';
                } else if (ico) {
                  t = t+ico+'</a>';
                } else {
                  t = '';
                }
                actions.push(t);
            }
            v += actions.join(cfg.actionsSeparator||' | ');
            return v;
        };
    },

    destroy: function() {
        delete this.items;
        delete this.renderer;
        return Ext.ux.grid.TextActionColumn.superclass.destroy.apply(this, arguments);
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     * Also fires any configured click handlers. By default, cancels the mousedown event to prevent selection.
     * Returns the event handler's status to allow cancelling of GridView's bubbling process.
     */
    processEvent : function(name, e, grid, rowIndex, colIndex){
        var m = e.getTarget().className.match(this.actionIdRe),
            item, fn;
        if (m && (item = this.items[parseInt(m[1], 10)])) {
            if (name == 'click') {
              var scope;
              if ('item'===item.scope) {
                scope = item;
              } else {
                scope = item.scope||this.scope||this;
              }
              (fn = item.handler || this.handler) && fn.call(scope, grid, rowIndex, colIndex, item, e);
            } else if ((name == 'mousedown') && (item.stopSelection !== false)) {
              return false;
            }
        }
        return Ext.ux.grid.TextActionColumn.superclass.processEvent.apply(this, arguments);
    }
});

// register ptype. Deprecate. Remove in 4.0
Ext.preg('textactioncolumn', Ext.ux.grid.TextActionColumn);

// backwards compat. Remove in 4.0
Ext.grid.TextActionColumn = Ext.ux.grid.TextActionColumn;

// register Column xtype
Ext.grid.Column.types.textactioncolumn = Ext.ux.grid.TextActionColumn;
