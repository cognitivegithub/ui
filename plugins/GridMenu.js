Ext.ns('Ext.ux.plugins');

/**
 * Плагин для добавления контекстного меню в грид.
 * Конфигурация: пропертя menuItems грида используется как items менюшки.
 * При этом handler этих айтемов, если он есть, переписывается так, чтобы при вызове
 * были следующие параметры:
 * b: Item This menu Item. (как у Ext.Menu.Item)
 * e : EventObject The click event. (как у Ext.Menu.Item)
 * row : Ext.data.Record по которой был клик мышом
 * grid : сам грид
 *
 * Также во время обработки события меню можно пользоваться пропертей grid.currentRow
 * в которой лежит Ext.data.Record последней записи, по которой был клик для вызова меню
 *
 * Перед вызовом меню файрит событие beforecontextmenu в грид со следующими параметрами:
 * grid: сам грид
 * menu: меню грида
 * row: Ext.data.Record по которому кликнули
 * index: индекс записи по которой кликнули
 *
 * Если событие возвращает false, то меню не отображается. В событии можно включать/выключать айтемы меню
 */


Ext.ux.plugins.GridMenu = {
  init: function(cmp) {
    if (!cmp.menuItems) {
      return;
    }
    if (!Ext.isArray(cmp.menuItems)) {
      cmp.menuItems = [cmp.menuItems];
    }
    (function(items){
      for (var i=items.length-1; i>=0; i--) {
        if (items[i].handler) {
          items[i].handler = (function(h){
            return function(b, e) {
              h(b, e, cmp.currentRow, cmp);
            }
          })(items[i].handler);
        }
      }
    })(cmp.menuItems);
    cmp.on('rowcontextmenu', function(grid, index, ev) {
      ev.preventDefault();
      if (!grid.ctxMenu) {
        grid.ctxMenu = new Ext.menu.Menu({
          items: grid.menuItems
        });
      }
      grid.currentRow = grid.getStore().getAt(index);
      if (grid.fireEvent('beforecontextmenu', grid, grid.ctxMenu, grid.currentRow, index)) {
        grid.ctxMenu.showAt(ev.getXY());
      }
    });
    cmp.on('destroy', function(grid) {
      if (grid.ctxMenu) {
        grid.ctxMenu.hide();
        grid.ctxMenu.destroy();
        delete grid.ctxMenu;
      }
      if (grid.currentRow) {
        delete grid.currentRow;
      }
    });
  }
};
