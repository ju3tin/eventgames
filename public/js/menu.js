$(document).on('pagecreate', '#menuPage', function() {
    $.getJSON('/menu.json', function(data) {
        const $menu = $('#dynamicMenu');

        function buildMenu(items, $parent) {
            items.forEach(item => {
                // If it has a "title", create a nested collapsible set
                if (item.title) {
                    const $li = $('<li></li>');
                    // Create collapsible + nested ul with desired classes
                    const $collapsible = $(`
                        <div data-role="collapsible">
                            <h3>${item.title}</h3>
                            <ul data-role="listview" class="ui-alt-icon ui-nodisc-icon"></ul>
                        </div>
                    `);
                    // Recursively build nested items
                    buildMenu(item.items, $collapsible.find('ul'));
                    $li.append($collapsible);
                    $parent.append($li);
                }
                // Leaf items
                else {
                    const $li = $('<li></li>');
                    if (item.icon) $li.attr('data-icon', item.icon);
                    if (item.filterText) $li.attr('data-filtertext', item.filterText);
                    if (item.class) $li.addClass(item.class);

                    const $a = $('<a></a>').attr('href', item.href);
                    if (item.ajax === false) $a.attr('data-ajax', 'false');
                    $a.text(item.text);

                    $li.append($a);
                    $parent.append($li);
                }
            });
        }

        // Add classes to the top-level ul as well
        $menu.addClass('ui-alt-icon ui-nodisc-icon');

        buildMenu(data.menu, $menu);
        $menu.listview().listview('refresh');
    });
});