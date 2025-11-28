import React, { useState, useCallback } from 'react';
import { Star, ThumbsUp, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useProductReviews } from '../hooks/useProductReviews';
import { useReviewPolling } from '@/hooks';
import ReviewForm from './ReviewForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import './ReviewSection.css';

const ReviewSection = ({ productId }) => {
    const {
        reviews,
        stats,
        loading,
        submitting,
        hasMore,
        submitReview,
        loadMore,
        refetch,
    } = useProductReviews(productId);
    const [showForm, setShowForm] = useState(false);

    // Polling cập nhật review mới (30s/lần)
    const fetchReviews = useCallback(() => {
        if (!showForm) {
            refetch();
        }
    }, [refetch, showForm]);

    useReviewPolling(fetchReviews, 30000, true);

    const handleSubmitReview = async (reviewData) => {
        const success = await submitReview(reviewData);
        if (success) {
            setShowForm(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={16}
                className={index < rating ? 'star-filled' : 'star-empty'}
                fill={index < rating ? 'currentColor' : 'none'}
            />
        ));
    };

    const renderRatingBar = (rating, count, total) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
            <div className="rating-bar" key={rating}>
                <span className="rating-label">{rating} ★</span>
                <div className="bar-container">
                    <div
                        className="bar-fill"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="rating-count">{count}</span>
            </div>
        );
    };

    if (loading && reviews.length === 0) {
        return (
            <div className="review-loading">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="review-section">
            <div className="review-header">
                <div className="review-header-left">
                    <h2>Customer Reviews</h2>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Write a Review'}
                </Button>
            </div>

            {showForm && (
                <Card className="review-form-card">
                    <ReviewForm
                        onSubmit={handleSubmitReview}
                        submitting={submitting}
                    />
                </Card>
            )}

            {stats && (
                <div className="review-stats">
                    <div className="stats-summary">
                        <div className="average-rating">
                            {stats.averageRating > 0 ? (
                                <>
                                    <span className="rating-number">
                                        {stats.averageRating}
                                    </span>
                                    <div className="stars-display">
                                        {renderStars(
                                            Math.round(stats.averageRating),
                                        )}
                                    </div>
                                </>
                            ) : (
                                <span className="rating-number">
                                    No ratings yet
                                </span>
                            )}
                            <span className="total-reviews">
                                {stats.total} reviews
                            </span>
                        </div>
                    </div>

                    {stats.averageRating > 0 && (
                        <div className="rating-distribution">
                            {[5, 4, 3, 2, 1].map((rating) =>
                                renderRatingBar(
                                    rating,
                                    stats.distribution[rating] || 0,
                                    stats.total,
                                ),
                            )}
                        </div>
                    )}
                </div>
            )}

            <Separator className="my-6" />

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <div className="no-reviews">
                        <p>
                            No reviews yet. Be the first to review this product!
                        </p>
                    </div>
                ) : (
                    <>
                        {reviews.map((review) => {
                            // --- [DEBUG LOG] ---
                            console.log('🔍 DEBUG REVIEW ITEM:', review);
                            console.log('👉 Avatar URL:', review.userId?.avatar);
                            console.log('👉 Comment:', review.comment);
                            // -------------------

                            // Xử lý an toàn dữ liệu User
                            const user = review.userId || {}; 
                            const userName = user.fullname || user.username || user.email?.split('@')[0] || 'Anonymous';
                            const userAvatar = user.avatar;

                            return (
                                <Card key={review._id} className="review-card">
                                    <div className="review-header-info">
                                        <div className="reviewer-info">
                                            {userAvatar ? (
                                                <img
                                                    src={userAvatar}
                                                    alt={userName}
                                                    className="reviewer-avatar"
                                                    onError={(e) => e.target.style.display = 'none'} // Ẩn nếu ảnh lỗi
                                                />
                                            ) : (
                                                <div className="reviewer-avatar-placeholder">
                                                    {userName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="reviewer-name">
                                                    {userName}
                                                </p>
                                                <p className="review-date">
                                                    {formatDate(review.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {review.rating && (
                                            <div className="review-rating">
                                                {renderStars(review.rating)}
                                            </div>
                                        )}
                                    </div>

                                    {/* [SỬA LỖI] Dùng review.comment thay vì review.content */}
                                    <p className="review-content">
                                        {review.comment || review.content} 
                                    </p>

                                    {/* Hiển thị ảnh review nếu có */}
                                    {review.imageUrls && review.imageUrls.length > 0 && (
                                        <div className="review-images-grid mt-3 flex gap-2">
                                            {review.imageUrls.map((img, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={img} 
                                                    alt="Review attachment" 
                                                    className="w-20 h-20 object-cover rounded border border-gray-200"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="review-actions">
                                        <Button variant="ghost" size="sm">
                                            <ThumbsUp size={16} />
                                            Helpful
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Flag size={16} />
                                            Report
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}

                        {hasMore && (
                            <div className="load-more">
                                <Button
                                    onClick={loadMore}
                                    variant="outline"
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Loading...'
                                        : 'Load More Reviews'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;