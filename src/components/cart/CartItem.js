import React from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import SmartImage from '../SmartImage';

const CartItem = ({ 
  item, 
  updating, 
  formatPrice, 
  getImageUrl, 
  onUpdateQuantity, 
  onRemove 
}) => {
  const product = item.product;
  const unitPrice = product?.effectivePrice || product?.price || item.unitPrice || 0;
  const totalPrice = unitPrice * item.quantity;

  return (
    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 transition-all duration-300 hover:border-primary-500 hover:border-opacity-50">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <SmartImage
            src={getImageUrl(product)}
            alt={product?.name || 'Ürün'}
            className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl"
            fallbackSrc="/images/placeholder.svg"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Product Details */}
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                {product?.name || 'Ürün adı bulunamadı'}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                <span className="text-gray-400 text-sm">
                  {product?.brand}
                </span>
                <span className="text-gray-400 text-sm">
                  {product?.category?.name}
                </span>
                <div className="text-primary-400 font-medium">
                  {formatPrice(unitPrice)} / adet
                </div>
              </div>

              {/* Sale Badge */}
              {product?.currentlyOnSale && (
                <div className="mt-2">
                  <span className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50 text-green-400 px-2 py-1 rounded text-xs">
                    %{product.discountPercentage || 'İndirimli'}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity & Price */}
            <div className="flex flex-col lg:items-end gap-4">
              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                  disabled={updating || item.quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <FaMinus />
                </button>
                
                <span className="w-16 text-center text-white font-semibold text-lg">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                  disabled={updating}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <FaPlus />
                </button>
              </div>

              {/* Total Price */}
              <div className="text-right">
                <div className="text-2xl font-bold text-white mb-1">
                  {formatPrice(totalPrice)}
                </div>
                {item.quantity > 1 && (
                  <div className="text-sm text-gray-400">
                    {item.quantity} × {formatPrice(unitPrice)}
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(item)}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-400 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <FaTrash />
                <span className="hidden sm:inline">Kaldır</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem; 