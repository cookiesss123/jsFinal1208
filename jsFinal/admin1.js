const deleteAllPlace = document.querySelector('.deleteAllPlace');

let orderData = [];
// 初始化 圖 表格
function init(){
    getOrders();
}
init();
// 取得訂單
function getOrders(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
        headers: {
          'Authorization': token
        }
    }).then(response=>{
        console.log(response.data.orders);
        orderData = response.data.orders;
        renderOrders();
        renderPieChart();
    }).catch(error=>{
        console.log(error.response.data);
    })
}

const orderTable = document.querySelector('#orderTable');
// 渲染表格
function renderOrders(){
    let str = '';
    orderData.forEach(item=>{
        // 產品名稱
        let productsName = ""
        item.products.forEach(productItem=>{
            productsName += `
                <li>${productItem.title} x ${productItem.quantity}</li>
            `
        });

        // 訂單日期
        let time = item.createdAt * 1000;
        let orderDate = new Date(time);

        str += `
        <tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                <ul>${productsName}</ul>
            </td>
            <td>${orderDate.getFullYear()}/${orderDate.getMonth() + 1}/${orderDate.getDate()}</td>
            <td class="orderStatus">
                <a href="#" class="status" data-status=${item.paid} data-id=${item.id}>${item.paid ? "已處理" : "未處理"}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${item.id}>
            </td>
        </tr>
        
        `
    })
    orderTable.innerHTML = str;

    let btnStr = '';
    if(orderData.length > 0){
        btnStr += `<a href="#" class="discardAllBtn">清除全部訂單</a>`
    }
    deleteAllPlace.innerHTML = btnStr;
}

// 渲染圓餅圖
function renderPieChart(){
    let obj = {}
    orderData.forEach(item=>{
        item.products.forEach(productItem=>{
            // 不存在
            if(obj[productItem.category] === undefined){
                obj[productItem.category] = productItem.price * productItem.quantity;
            }else{
                obj[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    });
    let pieData = Object.entries(obj);

    var chart = c3.generate({
        bindto: '#chart',
        data: {
            // iris data from R
            columns: pieData,
            type : 'pie',
            colors: {
                床架: '#DACBFF',
                收納: '#9D7FEA',
                窗簾: '#5434A7',
            }
        }
    });
}

// 刪除單筆訂單
orderTable.addEventListener('click',e=>{
    e.preventDefault();
    if(e.target.value === "刪除"){
        let orderId = e.target.getAttribute('data-id');
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
        {
            headers: {
              'Authorization': token
            }
        }).then(response=>{
            console.log(response.data);

              orderData.forEach(item=>{
                if(e.target.getAttribute('data-id') === item.id)
                alert(`編號 ${item.id} 訂單已刪除!`)
            });

            getOrders();
        })
    }
})

// 清除全部訂單
deleteAllPlace.addEventListener('click',e=>{
    e.preventDefault();
    console.log()
    if(e.target.getAttribute('class') === 'discardAllBtn'){
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            headers: {
              'Authorization': token
            }
        }).then(response=>{
            console.log(response.data);
            getOrders();
            alert(response.data.message)
        });
    }
})

// 修改訂單狀態 status的方法不行不知道為甚麼
orderTable.addEventListener('click',e=>{
    if(e.target.getAttribute('class') === 'status'){
        axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            "data": {
              "id": e.target.getAttribute('data-id'),
              "paid": e.target.textContent === "未處理" ? true : false 
            }
        },
        {
            headers: {
              'Authorization': token
            }
        }).then(response=>{
            console.log(response.data);
            getOrders();
        });
    }

})

