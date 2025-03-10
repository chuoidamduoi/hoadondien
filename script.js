// Khi tải trang lần đầu, xử lý hash hiện tại
// Khi trang được tải, kiểm tra mã hóa đơn và gọi API
document.addEventListener("DOMContentLoaded", function () {
    const billCode = getBillCodeFromURL(); // Lấy mã hóa đơn từ URL
    if (billCode) {
        console.log("Mã hóa đơn từ URL:", billCode);
        loadInvoiceData(billCode); // Gọi API và hiển thị thông tin hóa đơn
    } else {
        document.getElementById('invoice').innerHTML = '<p>Không tìm thấy mã hóa đơn trong URL.</p>';
    }
});

function getBillCodeFromURL() {
    const hash = window.location.hash; // Lấy toàn bộ hash từ URL
    const parts = hash.split("/"); // Tách thành mảng dựa trên dấu "/"
    return parts.length > 1 ? parts[1] : null; // Lấy phần tử thứ 2 nếu có
}


function isLoading(isLoading) {
    let submitButton = document.querySelector(".loading");
    if (submitButton) {
        submitButton.style.display = isLoading ? "flex" : "none";
    }
}
function convertMonth2(dateString) {
    // Create a new Date object
    const date = new Date(dateString);

    // Get the day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    // Format the date as dd/mm/yyyy
    const formattedDate = `${month}/${year}`
    return formattedDate;
}
function formatNumber(num) {
    if (isNaN(num) || num === "") return 0;
    return Number(num).toLocaleString();
}
const SCRIPT_URL = "https://electricity-management-server.onrender.com/api";
// const SCRIPT_URL = " http://localhost:3000/api"

async function getBillData(billCode) {
    isLoading(true)
    try {
        const response = await fetch(`${SCRIPT_URL}/getPaymentByMonthAndCustomer/${billCode}`);
        // const response = await fetch(`${SCRIPT_URL}/getPaymentByMonthAndCustomer/032025`); //test


        const rs = await response.json();
        isLoading(false)
        if (rs.success) return rs.data; // Trả về mảng đối tượng
        else return []
    } catch (error) {
        isLoading(false)
        console.error("Error fetching households:", error);
        return [];
    }
}

async function loadInvoiceData(billCode) {
    const bills = await getBillData(billCode);

    const tbody = document.getElementById('bill-list');
    tbody.innerHTML = '';
    bills.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td data-label="Tháng"><span>${convertMonth2(item.MONTH)}</span></td>
        <td data-label="Mã hộ"><span>${item.ID}</span></td>
        <td data-label="Họ tên"><span>${item.FULLNAME}</span></td>
        <td data-label="Số cũ"><span>${formatNumber(item.OLD_NUMBER)}</span></td>
        <td data-label="Số mới"><span>${formatNumber(item.NEW_NUMBER)}</span></td>
        <td data-label="Số điện sử dụng"><span>${formatNumber(item.CONSUMPTION)}</span></td>
        <td data-label="Giá tiền/kwh"><span>${formatNumber(item.KWH_AMOUNT)}</span></td>
        <td data-label="Số tiền phải đóng" class="highlight"><span>${formatNumber(item.AMOUNT)}</span></td>
        <td class="txt-highlight">${item.ISPAYMENT=='Y'?'Đã thanh toán':'Chưa thanh toán'}</td>
                    `;
        tbody.appendChild(tr);
    });
}