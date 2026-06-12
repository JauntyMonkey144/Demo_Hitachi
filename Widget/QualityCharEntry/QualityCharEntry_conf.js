/** QualityCharEntry Configuration File
 * Configuration Name: QualityCharEntry
 * Version: 1.0
 **/
(function () {
    var getConf = function (confName, widgetObject, cwidget, myConf) {
        if (typeof (window.conf) === 'undefined') {
            window.conf = {};
        }

        var conf = {
            title: "Nhập liệu Đặc tính (Quality Char Entry)",
            // Bạn có thể thêm các thông số tĩnh cấu hình ở đây sau này
        };

        return conf;
    };

    // Khởi tạo biến môi trường cho AVEVA
    if (typeof (window.conf) === 'undefined') {
        window.conf = {};
    }
    if (typeof (window.conf['QualityCharEntry']) === 'undefined') {
        window.conf['QualityCharEntry'] = getConf;
    }
})();