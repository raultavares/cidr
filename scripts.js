$(document).ready(function () {

    // set inital load with ordinary numbers

    rnd = (Math.floor(Math.random() * (90 - 0) + 0)).toString();

    values = ["10", rnd, "0", "0"];

    for (let i = 1; i <= values.length; i++) {

        $('#octet' + i).val(values[i - 1]);

        populateOctets(values[i - 1], 'octet' + i);

    }

    range = "16";
    $('#bits').val(range);

    $('#available-ips').text(getIPCount(range).toLocaleString());
    $("#net-mask").text(createNetmaskAddr(range));

    cidrBlock = "10." + rnd + ".0.0/" + range;

    ipRange = getIpRangeFromAddressAndNetmask(cidrBlock);

    $('#first-usable-ip').text(ipRange[0]);
    $('#last-usable-ip').text(ipRange[1]);

});

// trigger on every input change
$('input').bind('input', function () {

    var value = $(this).val();

    // get controller id
    controller_id = $(this).attr('id');

    if (controller_id.startsWith("octet")) {
        populateOctets(value, controller_id);
    } else {

        $(this).val($(this).val().replace(/[^0-9]/g, ''));
        value = limitBitsNumber(value);
        $(this).val(value);
        $('#available-ips').text(getIPCount(value).toLocaleString());
        $("#net-mask").text(createNetmaskAddr(value));
    }

    cidrBlock = ($('#octet1').val() + "." + $('#octet2').val() + "." + $('#octet3').val() + "." + $('#octet4').val() + "/" + $('#bits').val()).toString();

    ipRange = getIpRangeFromAddressAndNetmask(cidrBlock);

    $('#first-usable-ip').text(ipRange[0]);
    $('#last-usable-ip').text(ipRange[1]);

    if (value <= 29) {
        $('#warning-regular').fadeIn();
    } else {
        $('#warning-exceed').fadeIn();
    }

});

// populate binary representation of octets
function populateOctets(value, id) {

    // check if value is not null and not float
    if ((value !== '') && (value.indexOf('.') === -1)) {

        // guarantee value is less than 255
        value = limitOctetNumber(value);
        $(this).val(value);

        // get binary representation of the current value
        var binary_representation = dec2bin(value);

        // obtain array of binary representation split
        var binary_array = binToArray(binary_representation);

        // create a list with array representation and attach to the span HTML
        $('#' + id + '_placeholder').html(makeList(binary_array));

    }
}

// simple limit function for octet value
function limitOctetNumber(value) {

    if (value > 255) {

        return Math.floor(value / 10);
    } else {
        return value;
    }
}

// simple limit function for bits
function limitBitsNumber(value) {

    if (value > 32) {

        return Math.floor(value / 10);
    } else {
        return value;
    }
}

// transform number to 8-digit binary
function dec2bin(dec) {
    return (dec >>> 0).toString(2).padStart(8, '0');
}

// convert binary string representation to array
function binToArray(binary) {

    var binaryArray = Array.from(binary);
    return binaryArray;

}

// create HTML element unordered list with array values
function makeList(array) {
    // Create the list element:
    var list = document.createElement('ul');

    for (var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));

        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

// get numbe of possible IPs based on bits
function getIPCount(bitCount) {

    valor = 32 - bitCount;
    return Math.pow(2, valor);

}

// create a NetMask address representation
function createNetmaskAddr(bitCount) {
    var mask = [],
        i, n;
    for (i = 0; i < 4; i++) {
        n = Math.min(bitCount, 8);
        mask.push(256 - Math.pow(2, 8 - n));
        bitCount -= n;
    }
    return mask.join('.');
}


// based on all fields, get first and last usable IPs (IP Range)
function getIpRangeFromAddressAndNetmask(str) {
    var part = str.split("/"); // part[0] = base address, part[1] = netmask
    var ipaddress = part[0].split('.');
    var netmaskblocks = ["0", "0", "0", "0"];
    if (!/\d+\.\d+\.\d+\.\d+/.test(part[1])) {
        // part[1] has to be between 0 and 32
        netmaskblocks = ("1".repeat(parseInt(part[1], 10)) + "0".repeat(32 - parseInt(part[1], 10))).match(/.{1,8}/g);
        netmaskblocks = netmaskblocks.map(function (el) {
            return parseInt(el, 2);
        });
    } else {
        // xxx.xxx.xxx.xxx
        netmaskblocks = part[1].split('.').map(function (el) {
            return parseInt(el, 10)
        });
    }
    var invertedNetmaskblocks = netmaskblocks.map(function (el) {
        return el ^ 255;
    });
    var baseAddress = ipaddress.map(function (block, idx) {
        return block & netmaskblocks[idx];
    });
    var broadcastaddress = ipaddress.map(function (block, idx) {
        return block | invertedNetmaskblocks[idx];
    });

    // first and last ip are reserved if less than /30 block
    // if (part[1] <= 30) {
    //   baseAddress[3] = baseAddress[3] + 2;
    //   broadcastaddress[3] = broadcastaddress[3] - 2;
    // }

    return [baseAddress.join('.'), broadcastaddress.join('.')];
}