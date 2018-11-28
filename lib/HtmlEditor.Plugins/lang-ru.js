if (Ext.ux.form.HtmlEditor.HR) {
  Ext.ux.form.HtmlEditor.HR.prototype.langTitle       = 'Горизонтальный разделитель';
  Ext.ux.form.HtmlEditor.HR.prototype.langHelp        = 'Укажите ширину разделителя в процентах<br/> (со знаком %), либо без %<br/>для указания фиксированной ширины.',
  Ext.ux.form.HtmlEditor.HR.prototype.langInsert      = 'Вставить';
  Ext.ux.form.HtmlEditor.HR.prototype.langCancel      = 'Отмена';
  Ext.ux.form.HtmlEditor.HR.prototype.langWidth       = 'Ширина';
  Ext.ux.form.HtmlEditor.HR.prototype.defaultHRWidth  = '80%';
}

if (Ext.ux.form.HtmlEditor.Image) {
	Ext.ux.form.HtmlEditor.Image.prototype.langTitle    = 'Вставка изображения';
}

if (Ext.ux.form.HtmlEditor.RemoveFormat) {
  Ext.ux.form.HtmlEditor.RemoveFormat.prototype.midasBtns[1].tooltip.title = 'Очистить форматирование';
}

if (Ext.ux.form.HtmlEditor.IndentOutdent) {
  Ext.ux.form.HtmlEditor.IndentOutdent.prototype.midasBtns[1].tooltip.title = 'Добавить отступ';
  Ext.ux.form.HtmlEditor.IndentOutdent.prototype.midasBtns[2].tooltip.title = 'Убрать отступ';
}

if (Ext.ux.form.HtmlEditor.IndentOutdent) {
  Ext.ux.form.HtmlEditor.SubSuperScript.prototype.midasBtns[1].tooltip.title = 'В нижний индекс';
  Ext.ux.form.HtmlEditor.SubSuperScript.prototype.midasBtns[2].tooltip.title = 'В верхний индекс';
}

if (Ext.ux.form.HtmlEditor.FindAndReplace) {
	Ext.ux.form.HtmlEditor.FindAndReplace.prototype.langTitle   = 'Поиск/Замена';
	Ext.ux.form.HtmlEditor.FindAndReplace.prototype.langFind    = 'Найти';
	Ext.ux.form.HtmlEditor.FindAndReplace.prototype.langReplace = 'Заменить';
	Ext.ux.form.HtmlEditor.FindAndReplace.prototype.langReplaceWith = 'Заменить на';
	Ext.ux.form.HtmlEditor.FindAndReplace.prototype.langClose   = 'Закрыть';
}

if (Ext.ux.form.HtmlEditor.Table) {
  Ext.ux.form.HtmlEditor.Table.prototype.langTitle      = 'Вставить таблицу';
  Ext.ux.form.HtmlEditor.Table.prototype.langInsert     = 'Вставить';
  Ext.ux.form.HtmlEditor.Table.prototype.langCancel     = 'Отмена';
  Ext.ux.form.HtmlEditor.Table.prototype.langRows       = 'Строки';
  Ext.ux.form.HtmlEditor.Table.prototype.langColumns    = 'Столбцы';
  Ext.ux.form.HtmlEditor.Table.prototype.langBorder     = 'Рамки';
  Ext.ux.form.HtmlEditor.Table.prototype.tableBorderOptions[0][1] = 'Нет';
  Ext.ux.form.HtmlEditor.Table.prototype.tableBorderOptions[1][1] = 'Сплошные тонкие';
  Ext.ux.form.HtmlEditor.Table.prototype.tableBorderOptions[2][1] = 'Сплошные толстые';
  Ext.ux.form.HtmlEditor.Table.prototype.tableBorderOptions[3][1] = 'Тире';
  Ext.ux.form.HtmlEditor.Table.prototype.tableBorderOptions[4][1] = 'Точки';
  Ext.ux.form.HtmlEditor.Table.prototype.langCellLabel  = 'Подписать ячейки';
}

if (Ext.ux.form.HtmlEditor.Word) {
  Ext.ux.form.HtmlEditor.Word.prototype.langTitle     = 'Вставка из Ворда';
  Ext.ux.form.HtmlEditor.Word.prototype.langToolTip   = 'Чистить текст, вставляемый из Ворда и других редакторов.';
}

if (Ext.ux.form.HtmlEditor.Link) {
  Ext.ux.form.HtmlEditor.Link.prototype.langTitle   = 'Вставить ссылку';
  Ext.ux.form.HtmlEditor.Link.prototype.langInsert  = 'Вставить';
  Ext.ux.form.HtmlEditor.Link.prototype.langCancel  = 'Отмена';
  Ext.ux.form.HtmlEditor.Link.prototype.langTarget  = 'Открывать в';
  Ext.ux.form.HtmlEditor.Link.prototype.linkTargetOptions = [
    ['_self',   'текущем окнем'],
    ['_blank',  'новом окне']
  ];
  Ext.ux.form.HtmlEditor.Link.prototype.langURL     = 'URL';
  Ext.ux.form.HtmlEditor.Link.prototype.langText    = 'Текст';
}

if (Ext.ux.form.HtmlEditor.SpecialCharacters) {
  Ext.ux.form.HtmlEditor.SpecialCharacters.prototype.langTitle  = 'Вставка спец. символа';
  Ext.ux.form.HtmlEditor.SpecialCharacters.prototype.langInsert = 'Вставить';
  Ext.ux.form.HtmlEditor.SpecialCharacters.prototype.langCancel = 'Отмена';
}

if (Ext.ux.form.HtmlEditor.UndoRedo) {
  Ext.ux.form.HtmlEditor.UndoRedo.prototype.midasBtns[1].tooltip.title = 'Отменить';
  Ext.ux.form.HtmlEditor.UndoRedo.prototype.midasBtns[2].tooltip.title = 'Вернуть';
}