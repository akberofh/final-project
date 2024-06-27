import React, { useEffect, useState } from "react";
import styles from './Basket.module.scss';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Sepet listesi bileşeni
const Basket = () => {
    const [basketItems, setBasketItems] = useState([]);
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        // localStorage'den sepet listesini alın
        const storedBasketList = localStorage.getItem('basketList');

        if (storedBasketList) {
            const parsedBasketList = JSON.parse(storedBasketList);
            // Her ürünün count değerini sayıya dönüştür
            const updatedBasketItems = parsedBasketList.map(item => ({
                ...item,
                count: parseInt(item.count) || 1, // Eğer count NaN veya undefined ise 1 olarak ayarla
                price: parseFloat(item.price).toFixed(2) // Fiyatı ondalık kısmı iki basamakla sınırla
            }));
            setBasketItems(updatedBasketItems);
        }
    }, []);

    // Ürün sayısını artırma işlevi
    const handleIncreaseQuantity = (itemId) => {
        const updatedBasketItems = basketItems.map(item => {
            if (item.id === itemId) {
                const newCount = item.count + 1;
                const newPrice = item.price / item.count * newCount; // Yeni fiyatı hesapla

                return {
                    ...item,
                    count: newCount,
                    price: newPrice.toFixed(2) // Fiyatı güncelle, ondalık kısmı iki basamakla sınırla
                };
            }
            return item;
        });

        // Güncellenmiş sepet listesini localStorage'e kaydedin
        localStorage.setItem('basketList', JSON.stringify(updatedBasketItems));
        
        // State'i güncelleyin
        setBasketItems(updatedBasketItems);
    };

    // Ürün sayısını azaltma veya ürünü sepetten kaldırma işlevi
    const handleDecreaseQuantity = (itemId) => {
        const updatedBasketItems = basketItems.map(item => {
            if (item.id === itemId) {
                if (item.count > 1) {
                    const newCount = item.count - 1;
                    const newPrice = item.price / item.count * newCount; // Yeni fiyatı hesapla

                    return {
                        ...item,
                        count: newCount,
                        price: newPrice.toFixed(2) // Fiyatı güncelle, ondalık kısmı iki basamakla sınırla
                    };
                } else {
                    // Ürün adedi 1 ise ürünü sepetten kaldır
                    return null;
                }
            }
            return item;
        }).filter(item => item !== null); // null olanları filtrele
        
        // Güncellenmiş sepet listesini localStorage'e kaydedin
        localStorage.setItem('basketList', JSON.stringify(updatedBasketItems));
        
        // State'i güncelleyin
        setBasketItems(updatedBasketItems);
    };

    // Kullanıcının sepet listesini _id'ye göre filtrele
    const filteredBasketItems = basketItems.filter(item => item._id === userInfo._id);
   

    const handlePayment = (itemPrice) => {
        navigate('/basket/payment', { state: { itemPrice } });
    };

    return (
        <div className={styles.basketList}>
            <h2>Sepetiniz</h2>
            <ul>
                {filteredBasketItems.map((item, index) => (
                    <li key={index}>
                        <img src={item.thumbnail} alt={item.title} />
                        <div>
                            <h3>{item.title}</h3>
                            <p>Fiyat: {item.price}$</p>
                            <p>Adet: {item.count}</p>
                            <button onClick={() => handleIncreaseQuantity(item.id)}>Arttır</button>
                            {item.count === 1 && <button onClick={() => handleDecreaseQuantity(item.id)}>Sil</button>}
                            {item.count > 1 && <button onClick={() => handleDecreaseQuantity(item.id)}>Azalt</button>}
                            <button onClick={() => handlePayment(item.price)}>Ödeme yap</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Basket;
