'use strict';

/**
 * Json setup for the tiny editor for the write-a-post feature
 */
tinymce.init({
    selector: '#tinytext',
    menu: {
        file: {
            title: 'File',
            items: 'newdocument restoredraft | preview | export print | deleteallconversations'
        },
        edit: {
            title: 'Edit',
            items: 'undo redo | cut copy paste pastetext | selectall | searchreplace'
        },
        view: {
            title: 'View',
            items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments'
        },
        insert: {
            title: 'Insert',
            items: 'image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime'
        },
        format: {
            title: 'Format',
            items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat'
        },
        tools: {
            title: 'Tools',
            items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount'
        },
        table: {
            title: 'Table',
            items: 'inserttable | cell row column | advtablesort | tableprops deletetable'
        },
        help: {
            title: 'Help',
            items: 'help'
        }
    },
    mobile: {
        menubar: true
    }
});