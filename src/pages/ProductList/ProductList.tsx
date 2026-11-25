import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import React from 'react';

import { Products } from '../../types/Alltypes';
import { getData } from '../../fetch/httpClient';
import styles from './ProductList.module.scss';
import { ProductCarts } from '../../Functional/ProductCart/ProductCarts';
import { getSearchWith } from '../../getSearchWith';
import { Loader } from '../../components/Loader/Loader';

type Props = {
  product?: Products[];
  title?: boolean;
};

type Page = number | '...';

export const ProductList: React.FC<Props> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category } = useParams<{ category: string }>();

  const [item, setItem] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sortType = searchParams.get('sort') || 'age';
  const page = +(searchParams.get('page') || 1);
  const perPageParam = searchParams.get('perPage') || 'all';

  const perPage = perPageParam === 'all' ? item.length : +perPageParam;

  const startIndex = (page - 1) * perPage;
  const lastIndex = startIndex + perPage;

  const getPagination = (totalPages: number, currentPage: number): Page[] => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (__, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      totalPages,
    ];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setSearchWith(params: any) {
    const search = getSearchWith(params, searchParams);

    setSearchParams(search);
  }

  function handleSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSearchWith({ sort: event.target.value });
  }

  function handlePerPageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSearchWith({ perPage: event.target.value, page: 1 });
  }

  function handlePageChange(newPage: number) {
    setSearchWith({ page: newPage });
  }

  const getSortedPhones = () => {
    const sorted = [...item];

    switch (sortType) {
      case 'age':
        return sorted.sort((a, b) => b.year - a.year);
      case 'title':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      default:
        return sorted;
    }
  };

  const sortedPhones = getSortedPhones();
  const totalPages = Math.ceil(sortedPhones.length / perPage);
  const displayedPhones = sortedPhones.slice(startIndex, lastIndex);

  useEffect(() => {
    getData<Products[]>('./api/products.json')
      .then(data =>
        setItem(data.filter(product => product.category === category)),
      )
      .catch(() => setError('Something went wrong'))
      .finally(() => setLoading(false));
  }, [category, item.length, perPageParam, sortType, page, searchParams]);

  if (loading) {
    return (
      <div className={styles.loaderCenter}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {error} <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.containerPhones}>
      <Link to="/" className={styles.home}>
        <button className={styles.homeButton}>
          <img src="./img/home.svg" alt="home" className={styles.homeImg} />
          <img className={styles.arrow} src="./img/arrow.svg" alt="arrow" />
          <span className={styles.homeGoTo}>{category}</span>
        </button>
      </Link>

      <div className={styles.phonesProduct}>
        <h1 className={styles.name}>{category}</h1>
        <p className={styles.phonesModels}>{item.length} Models</p>
      </div>

      <div className={styles.dropdown}>
        <div className={styles.bySortedDropdown}>
          <p className={styles.bySorted}>Sort by</p>
          <select
            className={styles.selectSort}
            value={sortType}
            onChange={handleSortChange}
          >
            <option value="age">Newest</option>
            <option value="title">Alphabetically</option>
            <option value="price">Cheapest</option>
          </select>
        </div>

        <div className={styles.byFiltereDropdown}>
          <div className={styles.byItems}>Items on page</div>
          <select
            className={styles.selectFiltre}
            value={perPageParam}
            onChange={handlePerPageChange}
          >
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="16">16</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className={styles.catalogGrid}>
        {displayedPhones.map(phone => (
          <div key={phone.itemId} className={styles.gridItem}>
            <ProductCarts product={phone} />
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={styles.vectorButton}
        >
          <img
            src="./img/vectorLeft.svg"
            alt="prev"
            className={styles.vector}
          />
        </button>
        {getPagination(totalPages, page).map((itemP, index) =>
          itemP === '...' ? (
            <span key={`dots-${index}`}>...</span>
          ) : (
            <button
              key={itemP}
              onClick={() => handlePageChange(itemP)}
              disabled={itemP === page}
              className={styles.vectorCount}
            >
              {itemP}
            </button>
          ),
        )}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className={styles.vectorButton}
        >
          <img
            src="./img/vectorRight.svg"
            alt="next"
            className={styles.vector}
          />
        </button>
      </div>
    </div>
  );
};
