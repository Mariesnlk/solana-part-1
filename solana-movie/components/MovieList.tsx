import { Card } from './Card'
import { FC, useEffect, useMemo, useState } from 'react'
import { Movie } from '../models/Movie'
import * as web3 from '@solana/web3.js'
import { MovieCoordinator } from '../coordinators/MovieCoordinator'
import { Button, Center, HStack, Input, Spacer } from '@chakra-ui/react'

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN'

export const MovieList: FC = () => {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    const [movies, setMovies] = useState<Movie[]>([])
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    useEffect(() => {
        connection.getProgramAccounts(new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID))
        .then(async (accounts) => {
            const movies: Movie[] = accounts.reduce((accum: Movie[], { pubkey, account }) => {
                // try to extract movie item from account
                const movie = Movie.deserialize(account.data)
                // if the account does not have a review -> movie will be a null
                if (!movie) {
                    return accum
                }

                return [...accum, movie]
            }, [])
            setMovies(movies)
        })
    }, [])
    
    return (
        <div>
            {
                movies.map((movie, i) => <Card key={i} movie={movie} /> )
            }
        </div>
    )

    // useEffect(() => {
    //     MovieCoordinator.fetchPage(
    //         connection, 
    //         page, 
    //         5,
    //         search,
    //         search !== ''
    //     ).then(setMovies)
    // }, [page, search])
    // return (
    //     <div>
    //         <Center>
    //             <Input
    //                 id='search'
    //                 color='gray.400'
    //                 onChange={event => setSearch(event.currentTarget.value)}
    //                 placeholder='Search'
    //                 w='97%'
    //                 mt={2}
    //                 mb={2}
    //             />
    //         </Center>
    //         {
    //             movies.map((movie, i) => <Card key={i} movie={movie} /> )
    //         }
    //         <Center>
    //             <HStack w='full' mt={2} mb={8} ml={4} mr={4}>
    //                 {
    //                     page > 1 && <Button onClick={() => setPage(page - 1)}>Previous</Button>
    //                 }
    //                 <Spacer />
    //                 {
    //                     MovieCoordinator.accounts.length > page * 5 &&
    //                     <Button onClick={() => setPage(page + 1)}>Next</Button>
    //                 }
    //             </HStack>
    //         </Center>
    //     </div>
    // )
}