document.addEventListener("DOMContentLoaded", function () {
    // 初始化地图
    var map = L.map('map').setView([-27.4698, 153.0251], 13); // 设置中心位置和缩放级别

    // 添加地图图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // 处理评论提交
    const submitButton = document.querySelector('.rate-form button');
    const reviewSection = document.querySelector('.user-reviews');

    submitButton.addEventListener('click', function () {
        const textarea = document.querySelector('.rate-form textarea');
        const comment = textarea.value.trim();
        const ratingStars = document.querySelector('.rate-form .rating-stars').textContent.trim();
        
        if (comment) {
            // 创建新的评论元素
            const newReview = document.createElement('div');
            newReview.classList.add('review');

            newReview.innerHTML = `
                <div class="user-info">
                    <img src="user-avatar.png" alt="User Avatar">
                    <p>Anonymous</p>
                </div>
                <div class="user-comment">
                    <p>${comment}</p>
                    <div class="rating">${ratingStars}</div>
                </div>
            `;

            // 添加到评论部分
            reviewSection.appendChild(newReview);

            // 清除输入框内容
            textarea.value = '';
        } else {
            alert('Please write a comment!');
        }
    });
});
